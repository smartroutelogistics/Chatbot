const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware to get user by session ID
const getUser = async (req, res, next) => {
  try {
    const sessionId = req.headers['x-session-id'] || req.params.sessionId;
    
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

// GET /api/user/profile - Get user profile
router.get('/profile', getUser, async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      sessionId: user.sessionId,
      userType: user.userType,
      profile: user.profile,
      preferences: user.preferences,
      leadData: {
        score: user.leadData.score,
        isQualified: user.leadData.isQualified,
        interests: user.leadData.interests
      },
      analytics: {
        totalSessions: user.analytics.totalSessions,
        totalMessages: user.analytics.totalMessages,
        lastActivity: user.analytics.lastActivity,
        firstVisit: user.analytics.firstVisit
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// PUT /api/user/profile - Update user profile
router.put('/profile', getUser, async (req, res) => {
  try {
    const user = req.user;
    const { profile, preferences, userType } = req.body;

    // Update profile fields
    if (profile) {
      user.profile = { ...user.profile, ...profile };
      
      // Update lead score based on profile completeness
      const profileFields = Object.values(user.profile).filter(val => val && val.trim());
      const completionBonus = Math.floor(profileFields.length * 2);
      user.leadData.score = Math.min(100, user.leadData.score + completionBonus);
    }

    // Update preferences
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    // Update user type
    if (userType && ['trucker', 'shipper', 'visitor'].includes(userType)) {
      user.userType = userType;
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      profile: user.profile,
      preferences: user.preferences,
      userType: user.userType,
      leadScore: user.leadData.score
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// GET /api/user/analytics - Get user analytics
router.get('/analytics', getUser, async (req, res) => {
  try {
    const user = req.user;
    const dateRange = parseInt(req.query.days) || 30;
    
    // Calculate session duration (simplified)
    const averageSessionDuration = user.analytics.averageSessionDuration || 
      Math.floor(Math.random() * 600) + 60; // Placeholder calculation

    // Get conversation insights
    const conversationInsights = {
      totalMessages: user.conversationHistory.length,
      userMessages: user.conversationHistory.filter(msg => msg.sender === 'user').length,
      botMessages: user.conversationHistory.filter(msg => msg.sender === 'bot').length,
      topIntents: this.getTopIntents(user.conversationHistory),
      languageUsage: this.getLanguageUsage(user.conversationHistory)
    };

    res.json({
      sessionId: user.sessionId,
      analytics: {
        ...user.analytics.toObject(),
        averageSessionDuration,
        conversationInsights
      },
      leadData: user.leadData,
      dateRange
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ error: 'Failed to fetch user analytics' });
  }
});

// POST /api/user/feedback - Submit user feedback
router.post('/feedback', getUser, async (req, res) => {
  try {
    const user = req.user;
    const { rating, comment, category } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const feedback = {
      rating,
      comment: comment || '',
      category: category || 'general',
      timestamp: new Date()
    };

    user.feedback.push(feedback);

    // Update lead score based on feedback
    if (rating >= 4) {
      await user.updateLeadScore(5);
    } else if (rating <= 2) {
      await user.updateLeadScore(-2);
    }

    await user.save();

    res.json({
      message: 'Feedback submitted successfully',
      feedback,
      leadScore: user.leadData.score
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// GET /api/user/preferences/language - Get language preference
router.get('/preferences/language', getUser, async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      language: user.preferences.language,
      autoTranslate: user.preferences.autoTranslate,
      availableLanguages: ['en', 'es', 'ur', 'zh']
    });
  } catch (error) {
    console.error('Error fetching language preferences:', error);
    res.status(500).json({ error: 'Failed to fetch language preferences' });
  }
});

// PUT /api/user/preferences/language - Update language preference
router.put('/preferences/language', getUser, async (req, res) => {
  try {
    const user = req.user;
    const { language, autoTranslate } = req.body;

    if (language && !['en', 'es', 'ur', 'zh'].includes(language)) {
      return res.status(400).json({ error: 'Unsupported language' });
    }

    if (language) {
      user.preferences.language = language;
    }

    if (typeof autoTranslate === 'boolean') {
      user.preferences.autoTranslate = autoTranslate;
    }

    await user.save();

    res.json({
      message: 'Language preferences updated successfully',
      language: user.preferences.language,
      autoTranslate: user.preferences.autoTranslate
    });
  } catch (error) {
    console.error('Error updating language preferences:', error);
    res.status(500).json({ error: 'Failed to update language preferences' });
  }
});

// DELETE /api/user/data - Delete user data (GDPR compliance)
router.delete('/data', getUser, async (req, res) => {
  try {
    const user = req.user;
    const { confirmDeletion } = req.body;

    if (confirmDeletion !== true) {
      return res.status(400).json({ 
        error: 'Deletion must be confirmed',
        message: 'Set confirmDeletion to true to proceed'
      });
    }

    await User.findByIdAndDelete(user._id);

    res.json({
      message: 'User data deleted successfully',
      sessionId: user.sessionId,
      deletedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting user data:', error);
    res.status(500).json({ error: 'Failed to delete user data' });
  }
});

// Helper methods
router.getTopIntents = (messages) => {
  const intents = {};
  messages.forEach(msg => {
    if (msg.intent && msg.sender === 'bot') {
      intents[msg.intent] = (intents[msg.intent] || 0) + 1;
    }
  });
  
  return Object.entries(intents)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([intent, count]) => ({ intent, count }));
};

router.getLanguageUsage = (messages) => {
  const languages = {};
  messages.forEach(msg => {
    if (msg.language) {
      languages[msg.language] = (languages[msg.language] || 0) + 1;
    }
  });
  
  return Object.entries(languages)
    .map(([language, count]) => ({ language, count }));
};

module.exports = router;