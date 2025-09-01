const User = require('../models/User');
const nlpService = require('../services/nlpService');
const translationService = require('../services/translationService');

class SocketHandler {
  constructor(io) {
    this.io = io;
    this.activeConnections = new Map();
    this.liveAgents = new Map();
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);
      
      // Store connection info
      this.activeConnections.set(socket.id, {
        socketId: socket.id,
        connectedAt: new Date(),
        sessionId: null,
        user: null
      });

      // Handle user identification
      socket.on('identify', async (data) => {
        try {
          const { sessionId, userType, language } = data;
          
          let user = await User.findOne({ sessionId });
          if (!user) {
            user = new User({
              sessionId,
              userType: userType || 'visitor',
              preferences: {
                language: language || 'en'
              }
            });
            await user.save();
          }

          // Update connection info
          const connection = this.activeConnections.get(socket.id);
          connection.sessionId = sessionId;
          connection.user = user;

          socket.join(`user_${sessionId}`);
          
          // Send welcome message
          const welcomeMessage = await this.getWelcomeMessage(user);
          socket.emit('bot_message', welcomeMessage);

        } catch (error) {
          console.error('Error in identify handler:', error);
          socket.emit('error', { message: 'Failed to identify user' });
        }
      });

      // Handle user messages
      socket.on('user_message', async (data) => {
        try {
          const { text, sessionId } = data;
          const connection = this.activeConnections.get(socket.id);
          
          if (!connection || !connection.user) {
            socket.emit('error', { message: 'User not identified' });
            return;
          }

          const user = connection.user;
          
          // Validate message
          if (!text || text.trim().length === 0) {
            socket.emit('error', { message: 'Message cannot be empty' });
            return;
          }

          if (text.length > 500) {
            socket.emit('error', { message: 'Message too long' });
            return;
          }

          // Show typing indicator
          socket.emit('typing', { isTyping: true });

          // Add user message to history
          const userMessage = {
            messageId: `msg_${Date.now()}_user`,
            text,
            sender: 'user',
            timestamp: new Date(),
            language: user.preferences.language
          };

          await user.addMessage(userMessage);

          // Process message with NLP
          const nlpResponse = await nlpService.processMessage(
            text,
            user.userType,
            user.preferences.language,
            {
              topic: 'general',
              userType: user.userType,
              leadQualified: user.leadData.isQualified,
              previousInteractions: user.conversationHistory.length
            }
          );

          // Simulate realistic response time
          const responseDelay = Math.random() * 2000 + 1000; // 1-3 seconds
          
          setTimeout(async () => {
            try {
              // Stop typing indicator
              socket.emit('typing', { isTyping: false });

              // Update lead score
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

              // Add bot response to history
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
              await user.save();

              // Send response
              socket.emit('bot_message', {
                id: botMessage.messageId,
                text: nlpResponse.text,
                intent: nlpResponse.intent,
                confidence: nlpResponse.confidence,
                emotion: nlpResponse.emotion,
                language: nlpResponse.language,
                timestamp: botMessage.timestamp,
                suggestedActions: nlpResponse.suggestedActions || []
              });

              // Check if user should be escalated to live agent
              if (this.shouldEscalateToAgent(nlpResponse, user)) {
                setTimeout(() => {
                  socket.emit('suggest_live_agent', {
                    message: 'Would you like to speak with one of our specialists?',
                    reason: 'complex_query'
                  });
                }, 2000);
              }

            } catch (error) {
              console.error('Error sending bot response:', error);
              socket.emit('error', { message: 'Failed to process message' });
            }
          }, responseDelay);

        } catch (error) {
          console.error('Error in user_message handler:', error);
          socket.emit('error', { message: 'Failed to process message' });
        }
      });

      // Handle live agent requests
      socket.on('request_live_agent', async (data) => {
        try {
          const { reason, message } = data;
          const connection = this.activeConnections.get(socket.id);
          
          if (!connection || !connection.user) {
            socket.emit('error', { message: 'User not identified' });
            return;
          }

          // Find available agent (simplified)
          const availableAgent = this.findAvailableAgent();
          
          if (availableAgent) {
            // Connect to live agent
            socket.join(`agent_${availableAgent.id}`);
            socket.emit('agent_connected', {
              agentId: availableAgent.id,
              agentName: availableAgent.name,
              message: `Hi! I'm ${availableAgent.name}, and I'll be helping you today. What can I do for you?`
            });
          } else {
            // No agents available
            socket.emit('agent_unavailable', {
              message: 'All our agents are currently busy. You can continue chatting with me, or try again later.',
              estimatedWaitTime: '5-10 minutes'
            });
          }

        } catch (error) {
          console.error('Error in request_live_agent handler:', error);
          socket.emit('error', { message: 'Failed to connect to live agent' });
        }
      });

      // Handle language change
      socket.on('change_language', async (data) => {
        try {
          const { language } = data;
          const connection = this.activeConnections.get(socket.id);
          
          if (!connection || !connection.user) {
            socket.emit('error', { message: 'User not identified' });
            return;
          }

          const user = connection.user;
          user.preferences.language = language;
          await user.save();

          // Send confirmation in new language
          const greeting = translationService.getGreeting(language);
          socket.emit('language_changed', {
            language,
            greeting,
            quickReplies: translationService.getQuickReplies(language)
          });

        } catch (error) {
          console.error('Error in change_language handler:', error);
          socket.emit('error', { message: 'Failed to change language' });
        }
      });

      // Handle disconnect
      socket.on('disconnect', async (reason) => {
        console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
        
        const connection = this.activeConnections.get(socket.id);
        if (connection && connection.user) {
          // Update user's last activity
          try {
            await connection.user.updateActivity();
          } catch (error) {
            console.error('Error updating user activity on disconnect:', error);
          }
        }

        this.activeConnections.delete(socket.id);
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
      });
    });
  }

  async getWelcomeMessage(user) {
    const greeting = translationService.getGreeting(user.preferences.language);
    
    return {
      id: `welcome_${Date.now()}`,
      text: greeting,
      intent: 'welcome',
      confidence: 1.0,
      language: user.preferences.language,
      timestamp: new Date(),
      suggestedActions: [
        { type: 'quick_reply', title: 'Dispatching Services', payload: 'dispatching' },
        { type: 'quick_reply', title: 'Factoring Services', payload: 'factoring' },
        { type: 'quick_reply', title: 'Our Services', payload: 'about' }
      ]
    };
  }

  shouldEscalateToAgent(nlpResponse, user) {
    // Escalate if confidence is low
    if (nlpResponse.confidence < 0.4) return true;
    
    // Escalate if user seems frustrated
    if (nlpResponse.emotion && ['angry', 'frustrated'].includes(nlpResponse.emotion)) return true;
    
    // Escalate for support requests
    if (nlpResponse.intent === 'support') return true;
    
    // Escalate for high-value qualified leads
    if (user.leadData.isQualified && user.leadData.score > 80) return true;
    
    return false;
  }

  findAvailableAgent() {
    // Simplified agent availability (in real implementation, this would check actual agent status)
    const agents = [
      { id: 'agent_1', name: 'Sarah Johnson', specializations: ['dispatching', 'factoring'] },
      { id: 'agent_2', name: 'Mike Rodriguez', specializations: ['brokerage', 'support'] },
      { id: 'agent_3', name: 'Lisa Chen', specializations: ['factoring', 'support'] }
    ];

    // Return first available agent (simplified)
    return Math.random() > 0.3 ? agents[Math.floor(Math.random() * agents.length)] : null;
  }

  // Method to broadcast to all connected users
  broadcast(eventName, data) {
    this.io.emit(eventName, data);
  }

  // Method to send message to specific user
  sendToUser(sessionId, eventName, data) {
    this.io.to(`user_${sessionId}`).emit(eventName, data);
  }

  // Get connection statistics
  getStats() {
    return {
      totalConnections: this.activeConnections.size,
      activeAgents: this.liveAgents.size,
      connectionsPerHour: this.calculateConnectionsPerHour()
    };
  }

  calculateConnectionsPerHour() {
    // Simplified calculation - in real implementation, this would track actual metrics
    return Math.floor(this.activeConnections.size * 2.5);
  }
}

// Export factory function
module.exports = (io) => {
  return new SocketHandler(io);
};