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

// POST /api/live-chat/request - Request live agent
router.post('/request', getUser, async (req, res) => {
  try {
    const { reason, message, priority } = req.body;
    const user = req.user;

    // Validate input
    if (!reason) {
      return res.status(400).json({ error: 'Reason is required' });
    }

    const validReasons = [
      'complex_query', 'technical_issue', 'billing_question', 
      'complaint', 'sales_inquiry', 'urgent_matter', 'other'
    ];

    if (!validReasons.includes(reason)) {
      return res.status(400).json({ 
        error: 'Invalid reason',
        validReasons 
      });
    }

    // Create live chat request
    const computedPriority = priority || router.calculatePriority(user, reason);
    const chatRequest = {
      sessionId: user.sessionId,
      userType: user.userType,
      reason,
      message: message || '',
      priority: computedPriority,
      timestamp: new Date(),
      status: 'pending',
      estimatedWaitTime: router.calculateWaitTime(reason, computedPriority)
    };

    // Update user's lead score for requesting live chat
    await user.updateLeadScore(10);

    // In a real implementation, this would integrate with your live chat system
    // For now, we'll simulate the process
    const availableAgent = router.findAvailableAgent(reason, user.preferences.language);

    if (availableAgent) {
      chatRequest.status = 'assigned';
      chatRequest.agentId = availableAgent.id;
      chatRequest.agentName = availableAgent.name;
      
      res.json({
        status: 'success',
        message: 'Connected to live agent',
        request: chatRequest,
        agent: {
          id: availableAgent.id,
          name: availableAgent.name,
          specializations: availableAgent.specializations,
          languages: availableAgent.languages
        }
      });
    } else {
      // No agents available
      chatRequest.status = 'queued';
      
      res.json({
        status: 'queued',
        message: 'All agents are currently busy. You have been added to the queue.',
        request: chatRequest,
        position: router.getQueuePosition(chatRequest.priority),
        alternatives: [
          {
            type: 'callback',
            description: 'Request a callback when an agent is available',
            action: 'schedule_callback'
          },
          {
            type: 'email',
            description: 'Send your question via email for a detailed response',
            action: 'send_email'
          },
          {
            type: 'continue_bot',
            description: 'Continue chatting with our AI assistant',
            action: 'continue_bot'
          }
        ]
      });
    }

  } catch (error) {
    console.error('Error processing live chat request:', error);
    res.status(500).json({ error: 'Failed to process live chat request' });
  }
});

// GET /api/live-chat/agents - Get available agents (for admin)
router.get('/agents', async (req, res) => {
  try {
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // In a real implementation, this would fetch from your agent management system
    const agents = [
      {
        id: 'agent_001',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@smartroutelogistics.com',
        status: 'online',
        specializations: ['dispatching', 'factoring', 'new_carriers'],
        languages: ['en', 'es'],
        currentChats: 2,
        maxChats: 5,
        averageResponseTime: 45, // seconds
        satisfactionRating: 4.8,
        totalChatsToday: 12
      },
      {
        id: 'agent_002', 
        name: 'Mike Rodriguez',
        email: 'mike.rodriguez@smartroutelogistics.com',
        status: 'busy',
        specializations: ['brokerage', 'logistics', 'technical_support'],
        languages: ['en', 'es'],
        currentChats: 4,
        maxChats: 4,
        averageResponseTime: 62,
        satisfactionRating: 4.6,
        totalChatsToday: 18
      },
      {
        id: 'agent_003',
        name: 'Lisa Chen',
        email: 'lisa.chen@smartroutelogistics.com', 
        status: 'online',
        specializations: ['billing', 'payments', 'factoring'],
        languages: ['en', 'zh'],
        currentChats: 1,
        maxChats: 3,
        averageResponseTime: 38,
        satisfactionRating: 4.9,
        totalChatsToday: 8
      }
    ];

    const summary = {
      total: agents.length,
      online: agents.filter(a => a.status === 'online').length,
      busy: agents.filter(a => a.status === 'busy').length,
      offline: agents.filter(a => a.status === 'offline').length,
      averageResponseTime: agents.reduce((sum, a) => sum + a.averageResponseTime, 0) / agents.length,
      totalActiveChats: agents.reduce((sum, a) => sum + a.currentChats, 0)
    };

    res.json({
      agents,
      summary
    });

  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// POST /api/live-chat/callback - Schedule callback
router.post('/callback', getUser, async (req, res) => {
  try {
    const { phone, preferredTime, timezone, reason } = req.body;
    const user = req.user;

    // Validate phone number (basic validation)
    if (!phone || !/^\+?[\d\s\-\(\)]+$/.test(phone)) {
      return res.status(400).json({ error: 'Valid phone number is required' });
    }

    // Validate preferred time
    if (preferredTime && !Date.parse(preferredTime)) {
      return res.status(400).json({ error: 'Invalid preferred time format' });
    }

    const callback = {
      sessionId: user.sessionId,
      phone,
      preferredTime: preferredTime ? new Date(preferredTime) : null,
      timezone: timezone || 'America/New_York',
      reason: reason || 'general_inquiry',
      status: 'scheduled',
      requestedAt: new Date()
    };

    // Update user profile with phone number
    user.profile.phone = phone;
    await user.updateLeadScore(15); // Higher score for providing contact info
    await user.save();

    res.json({
      message: 'Callback scheduled successfully',
      callback,
      expectedCallTime: this.calculateCallbackTime(preferredTime, timezone)
    });

  } catch (error) {
    console.error('Error scheduling callback:', error);
    res.status(500).json({ error: 'Failed to schedule callback' });
  }
});

// GET /api/live-chat/queue - Get current queue status
router.get('/queue', async (req, res) => {
  try {
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Simulated queue data - in real implementation, this would come from your queue system
    const queueData = {
      totalInQueue: 7,
      averageWaitTime: 4.2, // minutes
      longestWaitTime: 8.5,
      queueByPriority: {
        high: 2,
        medium: 3, 
        low: 2
      },
      queueByReason: {
        complex_query: 3,
        technical_issue: 2,
        sales_inquiry: 1,
        complaint: 1
      },
      estimatedClearTime: 12 // minutes
    };

    res.json(queueData);

  } catch (error) {
    console.error('Error fetching queue status:', error);
    res.status(500).json({ error: 'Failed to fetch queue status' });
  }
});

// Helper methods
router.calculatePriority = (user, reason) => {
  let priority = 'medium';
  
  // High priority for qualified leads
  if (user.leadData.isQualified && user.leadData.score > 80) {
    priority = 'high';
  }
  
  // High priority for urgent matters and complaints
  if (['urgent_matter', 'complaint', 'technical_issue'].includes(reason)) {
    priority = 'high';
  }
  
  // Low priority for general inquiries from new users
  if (reason === 'other' && user.analytics.totalMessages < 5) {
    priority = 'low';
  }
  
  return priority;
};

router.calculateWaitTime = (reason, priority) => {
  const baseTimes = {
    high: 2,    // 2 minutes
    medium: 5,  // 5 minutes  
    low: 10     // 10 minutes
  };
  
  const reasonMultipliers = {
    urgent_matter: 0.5,
    complaint: 0.7,
    technical_issue: 0.8,
    sales_inquiry: 1.0,
    complex_query: 1.2,
    other: 1.5
  };
  
  const baseTime = baseTimes[priority] || baseTimes.medium;
  const multiplier = reasonMultipliers[reason] || 1.0;
  
  return Math.ceil(baseTime * multiplier);
};

router.findAvailableAgent = (reason, language) => {
  // Simulated agent matching - in real implementation, this would query your agent system
  const agents = [
    {
      id: 'agent_001',
      name: 'Sarah Johnson',
      specializations: ['dispatching', 'factoring'],
      languages: ['en', 'es'],
      available: true
    },
    {
      id: 'agent_002',
      name: 'Mike Rodriguez', 
      specializations: ['brokerage', 'technical_support'],
      languages: ['en', 'es'],
      available: false
    },
    {
      id: 'agent_003',
      name: 'Lisa Chen',
      specializations: ['billing', 'payments'],
      languages: ['en', 'zh'], 
      available: true
    }
  ];
  
  // Find agents that match the criteria
  const suitableAgents = agents.filter(agent => 
    agent.available && 
    agent.languages.includes(language) &&
    (reason === 'other' || agent.specializations.some(spec => 
      reason.includes(spec.replace('_', ''))
    ))
  );
  
  // Return first suitable agent or any available agent
  return suitableAgents[0] || agents.find(a => a.available);
};

router.getQueuePosition = (priority) => {
  const positions = {
    high: Math.floor(Math.random() * 3) + 1,
    medium: Math.floor(Math.random() * 5) + 2, 
    low: Math.floor(Math.random() * 8) + 4
  };
  
  return positions[priority] || positions.medium;
};

router.calculateCallbackTime = (preferredTime, timezone) => {
  if (preferredTime) {
    return new Date(preferredTime);
  }
  
  // Default to next business day, 9 AM in specified timezone
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  
  return tomorrow;
};

module.exports = router;
