const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware to get user by session ID
const getUser = async (req, res, next) => {
  try {
    const sessionId = req.headers['x-session-id'] || req.body.sessionId;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    const user = await User.findOne({ sessionId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error in getUser middleware:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/feedback - Submit feedback
router.post('/', getUser, async (req, res) => {
  try {
    const { rating, comment, category } = req.body;
    const user = req.user;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        error: 'Rating must be between 1 and 5' 
      });
    }

    // Validate comment length
    if (comment && comment.length > 1000) {
      return res.status(400).json({ 
        error: 'Comment must be less than 1000 characters' 
      });
    }

    const feedback = {
      rating,
      comment: comment?.trim() || '',
      category: category || 'general',
      timestamp: new Date()
    };

    user.feedback.push(feedback);

    // Update lead score based on feedback
    if (rating >= 4) {
      await user.updateLeadScore(5); // Positive feedback increases score
    } else if (rating <= 2) {
      await user.updateLeadScore(-2); // Negative feedback decreases score
    }

    await user.save();

    // Send automated response based on rating
    let responseMessage = '';
    if (rating >= 4) {
      responseMessage = 'Thank you for the positive feedback! We\'re glad we could help you.';
    } else if (rating === 3) {
      responseMessage = 'Thank you for your feedback! We\'re always working to improve our service.';
    } else {
      responseMessage = 'Thank you for your feedback. We take all concerns seriously and will work to improve your experience.';
    }

    res.json({
      message: 'Feedback submitted successfully',
      feedback: {
        rating,
        comment: feedback.comment,
        category: feedback.category,
        timestamp: feedback.timestamp
      },
      response: responseMessage,
      leadScore: user.leadData.score
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// GET /api/feedback - Get user's feedback history
router.get('/', getUser, async (req, res) => {
  try {
    const user = req.user;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const feedback = user.feedback
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(offset, offset + limit);

    const totalFeedback = user.feedback.length;
    const averageRating = totalFeedback > 0 
      ? (user.feedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback).toFixed(1)
      : 0;

    res.json({
      feedback,
      pagination: {
        total: totalFeedback,
        limit,
        offset,
        hasMore: offset + limit < totalFeedback
      },
      summary: {
        totalFeedback,
        averageRating: parseFloat(averageRating)
      }
    });

  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// POST /api/feedback/rating - Quick rating without comment
router.post('/rating', getUser, async (req, res) => {
  try {
    const { rating, context } = req.body;
    const user = req.user;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        error: 'Rating must be between 1 and 5' 
      });
    }

    const feedback = {
      rating,
      comment: '',
      category: context || 'quick_rating',
      timestamp: new Date()
    };

    user.feedback.push(feedback);

    // Update lead score
    if (rating >= 4) {
      await user.updateLeadScore(3);
    } else if (rating <= 2) {
      await user.updateLeadScore(-1);
    }

    await user.save();

    res.json({
      message: 'Rating submitted successfully',
      rating,
      leadScore: user.leadData.score
    });

  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
});

// GET /api/feedback/categories - Get feedback categories
router.get('/categories', (req, res) => {
  const categories = [
    { id: 'general', name: 'General Feedback', description: 'Overall experience feedback' },
    { id: 'chatbot', name: 'Chatbot Performance', description: 'Feedback about chatbot responses' },
    { id: 'services', name: 'Services Information', description: 'Feedback about our services' },
    { id: 'technical', name: 'Technical Issues', description: 'Website or technical problems' },
    { id: 'suggestions', name: 'Suggestions', description: 'Ideas for improvement' },
    { id: 'complaint', name: 'Complaint', description: 'Service complaints or issues' },
    { id: 'compliment', name: 'Compliment', description: 'Positive feedback and compliments' }
  ];

  res.json({ categories });
});

// Admin routes (require authentication)
const requireAdmin = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// GET /api/feedback/admin/overview - Admin feedback overview
router.get('/admin/overview', requireAdmin, async (req, res) => {
  try {
    const dateRange = parseInt(req.query.days) || 30;
    const startDate = new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000);

    const feedbackAnalytics = await User.aggregate([
      { $unwind: '$feedback' },
      { $match: { 'feedback.timestamp': { $gte: startDate } } },
      {
        $group: {
          _id: {
            rating: '$feedback.rating',
            category: '$feedback.category',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$feedback.timestamp' } }
          },
          count: { $sum: 1 },
          userType: { $first: '$userType' }
        }
      }
    ]);

    // Process analytics
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const categoryDistribution = {};
    const dailyFeedback = {};

    feedbackAnalytics.forEach(item => {
      // Rating distribution
      ratingDistribution[item._id.rating] += item.count;
      
      // Category distribution
      const category = item._id.category;
      categoryDistribution[category] = (categoryDistribution[category] || 0) + item.count;
      
      // Daily feedback
      const date = item._id.date;
      dailyFeedback[date] = (dailyFeedback[date] || 0) + item.count;
    });

    // Calculate summary statistics
    const totalFeedback = Object.values(ratingDistribution).reduce((sum, count) => sum + count, 0);
    const averageRating = totalFeedback > 0 
      ? Object.entries(ratingDistribution).reduce((sum, [rating, count]) => sum + (rating * count), 0) / totalFeedback
      : 0;
    
    const positivePercentage = totalFeedback > 0 
      ? ((ratingDistribution[4] + ratingDistribution[5]) / totalFeedback * 100).toFixed(1)
      : 0;

    res.json({
      dateRange,
      summary: {
        totalFeedback,
        averageRating: parseFloat(averageRating.toFixed(2)),
        positivePercentage: parseFloat(positivePercentage)
      },
      distribution: {
        ratings: ratingDistribution,
        categories: categoryDistribution,
        daily: dailyFeedback
      },
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching feedback overview:', error);
    res.status(500).json({ error: 'Failed to fetch feedback overview' });
  }
});

// GET /api/feedback/admin/comments - Get all feedback comments
router.get('/admin/comments', requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category;
    const minRating = parseInt(req.query.minRating) || 1;
    const maxRating = parseInt(req.query.maxRating) || 5;

    const pipeline = [
      { $unwind: '$feedback' },
      {
        $match: {
          'feedback.comment': { $ne: '' },
          'feedback.rating': { $gte: minRating, $lte: maxRating }
        }
      }
    ];

    // Add category filter if specified
    if (category && category !== 'all') {
      pipeline[1].$match['feedback.category'] = category;
    }

    pipeline.push(
      {
        $project: {
          sessionId: 1,
          userType: 1,
          feedback: 1,
          createdAt: 1
        }
      },
      { $sort: { 'feedback.timestamp': -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    );

    const comments = await User.aggregate(pipeline);
    
    // Get total count for pagination
    const countPipeline = [...pipeline.slice(0, 2), { $count: 'total' }];
    const countResult = await User.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    res.json({
      comments: comments.map(item => ({
        sessionId: item.sessionId,
        userType: item.userType,
        rating: item.feedback.rating,
        comment: item.feedback.comment,
        category: item.feedback.category,
        timestamp: item.feedback.timestamp,
        userCreated: item.createdAt
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching feedback comments:', error);
    res.status(500).json({ error: 'Failed to fetch feedback comments' });
  }
});

module.exports = router;