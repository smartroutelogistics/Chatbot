const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware to check admin access (simplified)
const requireAdmin = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// GET /api/analytics/overview - Get general analytics overview
router.get('/overview', requireAdmin, async (req, res) => {
  try {
    const dateRange = parseInt(req.query.days) || 7;
    const startDate = new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000);

    const analytics = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          totalMessages: { $sum: '$analytics.totalMessages' },
          qualifiedLeads: {
            $sum: { $cond: ['$leadData.isQualified', 1, 0] }
          },
          averageLeadScore: { $avg: '$leadData.score' },
          truckerUsers: {
            $sum: { $cond: [{ $eq: ['$userType', 'trucker'] }, 1, 0] }
          },
          shipperUsers: {
            $sum: { $cond: [{ $eq: ['$userType', 'shipper'] }, 1, 0] }
          },
          visitorUsers: {
            $sum: { $cond: [{ $eq: ['$userType', 'visitor'] }, 1, 0] }
          }
        }
      }
    ]);

    const result = analytics[0] || {
      totalUsers: 0,
      totalMessages: 0,
      qualifiedLeads: 0,
      averageLeadScore: 0,
      truckerUsers: 0,
      shipperUsers: 0,
      visitorUsers: 0
    };

    // Calculate additional metrics
    const conversionRate = result.totalUsers > 0 ? 
      ((result.qualifiedLeads / result.totalUsers) * 100).toFixed(2) : 0;
    
    const averageMessagesPerUser = result.totalUsers > 0 ? 
      (result.totalMessages / result.totalUsers).toFixed(2) : 0;

    res.json({
      dateRange,
      overview: {
        ...result,
        conversionRate: parseFloat(conversionRate),
        averageMessagesPerUser: parseFloat(averageMessagesPerUser)
      },
      userTypeDistribution: {
        trucker: result.truckerUsers,
        shipper: result.shipperUsers,
        visitor: result.visitorUsers
      },
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({ error: 'Failed to fetch analytics overview' });
  }
});

// GET /api/analytics/conversations - Get conversation analytics
router.get('/conversations', requireAdmin, async (req, res) => {
  try {
    const dateRange = parseInt(req.query.days) || 7;
    const startDate = new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000);

    const conversationAnalytics = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: '$conversationHistory' },
      { $match: { 'conversationHistory.timestamp': { $gte: startDate } } },
      {
        $group: {
          _id: {
            intent: '$conversationHistory.intent',
            language: '$conversationHistory.language',
            userType: '$userType'
          },
          count: { $sum: 1 },
          averageConfidence: { $avg: '$conversationHistory.confidence' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Process results
    const intentDistribution = {};
    const languageDistribution = {};
    const userTypeIntents = { trucker: {}, shipper: {}, visitor: {} };

    conversationAnalytics.forEach(item => {
      const { intent, language, userType } = item._id;
      
      // Intent distribution
      intentDistribution[intent] = (intentDistribution[intent] || 0) + item.count;
      
      // Language distribution
      languageDistribution[language] = (languageDistribution[language] || 0) + item.count;
      
      // User type intents
      if (userTypeIntents[userType]) {
        userTypeIntents[userType][intent] = (userTypeIntents[userType][intent] || 0) + item.count;
      }
    });

    res.json({
      dateRange,
      conversationAnalytics: {
        intentDistribution,
        languageDistribution,
        userTypeIntents,
        topIntents: Object.entries(intentDistribution)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .map(([intent, count]) => ({ intent, count }))
      },
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching conversation analytics:', error);
    res.status(500).json({ error: 'Failed to fetch conversation analytics' });
  }
});

// GET /api/analytics/leads - Get lead analytics
router.get('/leads', requireAdmin, async (req, res) => {
  try {
    const dateRange = parseInt(req.query.days) || 7;
    const startDate = new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000);

    const leadAnalytics = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            userType: '$userType',
            scoreRange: {
              $switch: {
                branches: [
                  { case: { $lt: ['$leadData.score', 25] }, then: '0-25' },
                  { case: { $lt: ['$leadData.score', 50] }, then: '25-50' },
                  { case: { $lt: ['$leadData.score', 75] }, then: '50-75' },
                  { case: { $gte: ['$leadData.score', 75] }, then: '75-100' }
                ],
                default: '0-25'
              }
            }
          },
          count: { $sum: 1 },
          averageScore: { $avg: '$leadData.score' },
          totalInterests: { $sum: { $size: '$leadData.interests' } }
        }
      }
    ]);

    // Get qualified leads by date
    const qualifiedLeadsTrend = await User.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate },
          'leadData.isQualified': true 
        } 
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Get top interests
    const topInterests = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: '$leadData.interests' },
      {
        $group: {
          _id: '$leadData.interests',
          count: { $sum: 1 },
          averageScore: { $avg: '$leadData.score' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      dateRange,
      leadAnalytics: {
        scoreDistribution: leadAnalytics,
        qualifiedLeadsTrend,
        topInterests: topInterests.map(item => ({
          interest: item._id,
          count: item.count,
          averageScore: Math.round(item.averageScore)
        }))
      },
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching lead analytics:', error);
    res.status(500).json({ error: 'Failed to fetch lead analytics' });
  }
});

// GET /api/analytics/performance - Get chatbot performance metrics
router.get('/performance', requireAdmin, async (req, res) => {
  try {
    const dateRange = parseInt(req.query.days) || 7;
    const startDate = new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000);

    // Calculate average confidence scores
    const confidenceAnalytics = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: '$conversationHistory' },
      { 
        $match: { 
          'conversationHistory.timestamp': { $gte: startDate },
          'conversationHistory.confidence': { $exists: true }
        } 
      },
      {
        $group: {
          _id: '$conversationHistory.intent',
          averageConfidence: { $avg: '$conversationHistory.confidence' },
          messageCount: { $sum: 1 },
          lowConfidenceCount: {
            $sum: { $cond: [{ $lt: ['$conversationHistory.confidence', 0.5] }, 1, 0] }
          }
        }
      }
    ]);

    // Get response time metrics (simulated - in real implementation, track actual times)
    const responseTimeMetrics = {
      averageResponseTime: 1.2, // seconds
      medianResponseTime: 0.9,
      p95ResponseTime: 2.1
    };

    // Get user satisfaction from feedback
    const satisfactionMetrics = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: '$feedback' },
      { $match: { 'feedback.timestamp': { $gte: startDate } } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$feedback.rating' },
          totalFeedback: { $sum: 1 },
          ratingDistribution: {
            $push: '$feedback.rating'
          }
        }
      }
    ]);

    const satisfaction = satisfactionMetrics[0] || {
      averageRating: 0,
      totalFeedback: 0,
      ratingDistribution: []
    };

    // Calculate rating distribution
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    satisfaction.ratingDistribution.forEach(rating => {
      ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
    });

    res.json({
      dateRange,
      performance: {
        confidenceMetrics: confidenceAnalytics,
        responseTimeMetrics,
        satisfactionMetrics: {
          ...satisfaction,
          ratingDistribution: ratingCounts
        },
        overallScore: router.calculateOverallScore(confidenceAnalytics, satisfaction.averageRating)
      },
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
});

// GET /api/analytics/real-time - Get real-time metrics
router.get('/real-time', requireAdmin, async (req, res) => {
  try {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);

    const realTimeMetrics = await User.aggregate([
      {
        $facet: {
          activeUsers: [
            { $match: { 'analytics.lastActivity': { $gte: lastHour } } },
            { $count: 'count' }
          ],
          newUsersToday: [
            { $match: { createdAt: { $gte: last24Hours } } },
            { $count: 'count' }
          ],
          messagesLastHour: [
            { $unwind: '$conversationHistory' },
            { $match: { 'conversationHistory.timestamp': { $gte: lastHour } } },
            { $count: 'count' }
          ],
          qualifiedLeadsToday: [
            { 
              $match: { 
                createdAt: { $gte: last24Hours },
                'leadData.isQualified': true 
              } 
            },
            { $count: 'count' }
          ]
        }
      }
    ]);

    const metrics = realTimeMetrics[0];
    const result = {
      activeUsers: metrics.activeUsers[0]?.count || 0,
      newUsersToday: metrics.newUsersToday[0]?.count || 0,
      messagesLastHour: metrics.messagesLastHour[0]?.count || 0,
      qualifiedLeadsToday: metrics.qualifiedLeadsToday[0]?.count || 0,
      timestamp: new Date().toISOString()
    };

    res.json(result);

  } catch (error) {
    console.error('Error fetching real-time metrics:', error);
    res.status(500).json({ error: 'Failed to fetch real-time metrics' });
  }
});

// Helper method to calculate overall performance score
router.calculateOverallScore = (confidenceMetrics, averageRating) => {
  if (!confidenceMetrics.length && !averageRating) return 0;
  
  const avgConfidence = confidenceMetrics.length > 0 ? 
    confidenceMetrics.reduce((sum, item) => sum + item.averageConfidence, 0) / confidenceMetrics.length : 0;
  
  const confidenceScore = avgConfidence * 50; // Max 50 points
  const satisfactionScore = (averageRating / 5) * 50; // Max 50 points
  
  return Math.round(confidenceScore + satisfactionScore);
};

module.exports = router;
