const express = require('express');
const router = express.Router();
const User = require('../models/User');
const nlpService = require('../services/nlpService');
const translationService = require('../services/translationService');

// Middleware to get or create user session
const getOrCreateUser = async (req, res, next) => {
  try {
    const sessionId = req.headers['x-session-id'] || req.body.sessionId;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    let user = await User.findOne({ sessionId });
    
    if (!user) {
      // Create new user
      user = new User({
        sessionId,
        userType: req.body.userType || 'visitor',
        preferences: {
          language: req.body.language || 'en'
        }
      });
      await user.save();
    } else {
      // Update last activity
      await user.updateActivity();
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error in getOrCreateUser middleware:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/chat/message - Process user message
router.post('/message', getOrCreateUser, async (req, res) => {
  try {
    const { text, userType, language, context } = req.body;
    const user = req.user;

    // Validate input
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    if (text.length > 500) {
      return res.status(400).json({ error: 'Message too long. Maximum 500 characters.' });
    }

    // Update user profile if provided
    if (userType && userType !== user.userType) {
      user.userType = userType;
    }

    if (language && language !== user.preferences.language) {
      user.preferences.language = language;
    }

    // Add user message to conversation history
    const userMessage = {
      messageId: `msg_${Date.now()}_user`,
      text,
      sender: 'user',
      timestamp: new Date(),
      language: language || user.preferences.language
    };

    await user.addMessage(userMessage);

    // Process message with NLP
    const nlpResponse = await nlpService.processMessage(
      text,
      user.userType,
      user.preferences.language,
      {
        topic: context?.topic || 'general',
        userType: user.userType,
        leadQualified: user.leadData.isQualified,
        previousInteractions: user.conversationHistory.length
      }
    );

    // Update lead score based on intent
    const intentScores = {
      dispatching: 15,
      factoring: 10,
      brokerage: 12,
      pricing: 8,
      signup: 25,
      support: 5
    };

    if (intentScores[nlpResponse.intent]) {
      await user.updateLeadScore(intentScores[nlpResponse.intent]);
    }

    // Add bot response to conversation history
    const botMessage = {
      messageId: `msg_${Date.now()}_bot`,
      text: nlpResponse.text,
      sender: 'bot',
      timestamp: new Date(),
      language: nlpResponse.language,
      intent: nlpResponse.intent,
      confidence: nlpResponse.confidence,
      emotion: nlpResponse.emotion
    };

    await user.addMessage(botMessage);

    // Save user updates
    await user.save();

    // Return response
    res.json({
      text: nlpResponse.text,
      intent: nlpResponse.intent,
      confidence: nlpResponse.confidence,
      emotion: nlpResponse.emotion,
      language: nlpResponse.language,
      suggestedActions: nlpResponse.suggestedActions || [],
      userProfile: {
        leadScore: user.leadData.score,
        isQualified: user.leadData.isQualified,
        totalMessages: user.analytics.totalMessages
      }
    });

  } catch (error) {
    console.error('Error processing chat message:', error);
    res.status(500).json({
      error: 'Failed to process message',
      text: 'I apologize, but I encountered an error. Please try again or contact our support team.'
    });
  }
});

// GET /api/chat/history - Get conversation history
router.get('/history', getOrCreateUser, async (req, res) => {
  try {
    const user = req.user;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const history = user.conversationHistory
      .slice(-limit - offset, -offset || undefined)
      .reverse();

    res.json({
      messages: history,
      total: user.conversationHistory.length,
      hasMore: user.conversationHistory.length > limit + offset
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// POST /api/chat/clear-history - Clear conversation history
router.post('/clear-history', getOrCreateUser, async (req, res) => {
  try {
    const user = req.user;
    user.conversationHistory = [];
    await user.save();

    res.json({ message: 'Chat history cleared successfully' });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
});

// GET /api/chat/suggestions - Get quick reply suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const language = req.query.language || 'en';
    const userType = req.query.userType || 'visitor';

    const suggestions = {
      visitor: translationService.getQuickReplies(language),
      trucker: {
        en: [
          "Need dispatching help 🚚",
          "Factoring services 💰",
          "Load tracking 📍",
          "Apply as carrier 📋",
          "Contact support 📞"
        ],
        es: [
          "Necesito ayuda con despacho 🚚",
          "Servicios de factoring 💰",
          "Rastreo de carga 📍", 
          "Aplicar como transportista 📋",
          "Contactar soporte 📞"
        ],
        ur: [
          "ڈسپیچنگ میں مدد چاہیے 🚚",
          "فیکٹرنگ سروسز 💰",
          "لوڈ ٹریکنگ 📍",
          "کیریئر کے طور پر اپلائی کریں 📋",
          "سپورٹ سے رابطہ 📞"
        ],
        zh: [
          "需要调度帮助 🚚",
          "保理服务 💰",
          "货物跟踪 📍",
          "申请成为承运商 📋",
          "联系客服 📞"
        ]
      },
      shipper: {
        en: [
          "Ship my freight 📦",
          "Get freight quote 💲",
          "Track shipment 📍",
          "Carrier network 🚛",
          "Contact support 📞"
        ],
        es: [
          "Enviar mi carga 📦",
          "Obtener cotización 💲",
          "Rastrear envío 📍",
          "Red de transportistas 🚛",
          "Contactar soporte 📞"
        ],
        ur: [
          "اپنا مال بھیجیں 📦",
          "فریٹ کوٹ حاصل کریں 💲",
          "شپمنٹ ٹریک کریں 📍",
          "کیریئر نیٹ ورک 🚛",
          "سپورٹ سے رابطہ 📞"
        ],
        zh: [
          "运输我的货物 📦",
          "获取运费报价 💲",
          "跟踪货物 📍",
          "承运商网络 🚛",
          "联系客服 📞"
        ]
      }
    };

    const userSuggestions = suggestions[userType] || suggestions.visitor;
    const languageSuggestions = typeof userSuggestions === 'object' 
      ? userSuggestions[language] || userSuggestions.en 
      : userSuggestions;

    res.json({ suggestions: languageSuggestions });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

// POST /api/chat/context - Update conversation context
router.post('/context', getOrCreateUser, async (req, res) => {
  try {
    const { topic, metadata } = req.body;
    const user = req.user;

    // Update user interests based on context
    if (topic && !user.leadData.interests.includes(topic)) {
      user.leadData.interests.push(topic);
      await user.save();
    }

    res.json({ 
      message: 'Context updated successfully',
      leadScore: user.leadData.score,
      interests: user.leadData.interests
    });
  } catch (error) {
    console.error('Error updating context:', error);
    res.status(500).json({ error: 'Failed to update context' });
  }
});

module.exports = router;