const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userType: {
    type: String,
    enum: ['trucker', 'shipper', 'visitor'],
    default: 'visitor'
  },
  profile: {
    name: String,
    email: String,
    phone: String,
    company: String,
    location: String
  },
  preferences: {
    language: {
      type: String,
      enum: ['en', 'es', 'ur', 'zh'],
      default: 'en'
    },
    notifications: {
      type: Boolean,
      default: true
    },
    saveHistory: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    autoTranslate: {
      type: Boolean,
      default: false
    }
  },
  conversationHistory: [{
    messageId: String,
    text: String,
    sender: {
      type: String,
      enum: ['user', 'bot', 'agent']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    language: String,
    intent: String,
    confidence: Number,
    emotion: String
  }],
  leadData: {
    isQualified: {
      type: Boolean,
      default: false
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    interests: [String],
    budget: String,
    timeline: String,
    contactAttempts: {
      type: Number,
      default: 0
    }
  },
  analytics: {
    totalSessions: {
      type: Number,
      default: 1
    },
    totalMessages: {
      type: Number,
      default: 0
    },
    averageSessionDuration: Number,
    lastActivity: {
      type: Date,
      default: Date.now
    },
    firstVisit: {
      type: Date,
      default: Date.now
    },
    deviceInfo: {
      userAgent: String,
      platform: String,
      isMobile: Boolean
    }
  },
  feedback: [{
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    category: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ 'analytics.lastActivity': -1 });
userSchema.index({ userType: 1 });
userSchema.index({ 'preferences.language': 1 });
userSchema.index({ 'leadData.isQualified': 1 });

// Virtual for active sessions (last activity within 30 minutes)
userSchema.virtual('isActive').get(function() {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  return this.analytics.lastActivity > thirtyMinutesAgo;
});

// Method to update last activity
userSchema.methods.updateActivity = function() {
  this.analytics.lastActivity = new Date();
  return this.save();
};

// Method to add message to conversation history
userSchema.methods.addMessage = function(messageData) {
  if (this.preferences.saveHistory) {
    this.conversationHistory.push(messageData);
    this.analytics.totalMessages += 1;
    
    // Keep only last 100 messages to prevent bloat
    if (this.conversationHistory.length > 100) {
      this.conversationHistory = this.conversationHistory.slice(-100);
    }
  }
  return this.save();
};

// Method to update lead score
userSchema.methods.updateLeadScore = function(points) {
  this.leadData.score = Math.min(100, Math.max(0, this.leadData.score + points));
  if (this.leadData.score >= 70) {
    this.leadData.isQualified = true;
  }
  return this.save();
};

// Static method to find active users
userSchema.statics.findActiveUsers = function() {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  return this.find({ 'analytics.lastActivity': { $gte: thirtyMinutesAgo } });
};

// Static method to get user analytics
userSchema.statics.getAnalytics = function(dateRange = 7) {
  const startDate = new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        totalMessages: { $sum: '$analytics.totalMessages' },
        qualifiedLeads: {
          $sum: { $cond: ['$leadData.isQualified', 1, 0] }
        },
        averageScore: { $avg: '$leadData.score' },
        languageDistribution: {
          $push: '$preferences.language'
        },
        userTypeDistribution: {
          $push: '$userType'
        }
      }
    }
  ]);
};

module.exports = mongoose.model('User', userSchema);