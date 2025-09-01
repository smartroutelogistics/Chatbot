# SmartRoute Logistics Chatbot

A comprehensive, multilingual AI chatbot built specifically for SmartRoute Logistics, featuring advanced NLP, real-time communication, and seamless integration with your logistics website.

## 🚀 Features

### Core Features
- **Natural Language Processing**: Advanced NLP with OpenAI GPT-4 integration
- **Multilingual Support**: English, Spanish, Urdu, and Chinese with auto-detection
- **Real-time Communication**: WebSocket-powered live chat with typing indicators
- **Personalization**: User profiles with conversation memory and preferences
- **Multi-Intent Handling**: Process complex queries with multiple topics
- **Emotion Detection**: Analyze sentiment and respond empathetically

### SmartRoute Specific Features
- **Industry-Focused**: Specialized knowledge of trucking, dispatching, and logistics
- **User Type Recognition**: Different flows for truckers vs shippers
- **Lead Qualification**: Automatic lead scoring and qualification system
- **Service Integration**: Direct integration with dispatching, factoring, and brokerage services

### Advanced Features
- **Live Agent Handover**: Seamless transition to human support when needed
- **Proactive Messaging**: Smart engagement based on user behavior
- **Analytics Dashboard**: Comprehensive performance tracking and insights
- **Feedback System**: Built-in rating and feedback collection
- **Voice Integration**: Optional voice interaction capabilities
- **Mobile Responsive**: Optimized for all devices

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **React 18** with TypeScript for type safety
- **Styled Components** for dynamic styling
- **Framer Motion** for smooth animations
- **Socket.IO Client** for real-time communication
- **Axios** for HTTP requests

### Backend (Node.js + Express)
- **Express.js** web framework
- **Socket.IO** for WebSocket communication
- **MongoDB** with Mongoose ODM
- **OpenAI API** for advanced NLP
- **Google Cloud Translation** for multilingual support

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn package manager

### Clone Repository
```bash
git clone <repository-url>
cd chatbot
```

### Install Dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies (client + server)
npm run install-all
```

### Environment Configuration

#### Server Configuration
```bash
cd server
cp .env.example .env
# Edit .env with your configuration
```

Required environment variables:
- `MONGODB_URI`: Your MongoDB connection string
- `OPENAI_API_KEY`: OpenAI API key (optional)
- `ADMIN_API_KEY`: Secure key for admin endpoints

#### Client Configuration
```bash
cd client  
cp .env.example .env
# Edit .env with your configuration
```

### Database Setup
```bash
# Start MongoDB service
# The application will automatically create collections on first run
```

## 🚀 Running the Application

### Development Mode
```bash
# Run both client and server concurrently
npm run dev
```

This will start:
- Client on http://localhost:3000
- Server on http://localhost:5000

### Production Mode
```bash
# Build client
npm run build

# Start server
npm start
```

## 📱 Usage

### Basic Integration
Add the chatbot to your website by including the built React component:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Your Website</title>
</head>
<body>
    <!-- Your existing content -->
    
    <!-- Chatbot will appear as a floating widget -->
    <div id="chatbot-root"></div>
    
    <script src="path/to/chatbot-bundle.js"></script>
</body>
</html>
```

### API Usage
The chatbot exposes REST APIs for integration:

```javascript
// Send a message
POST /api/chat/message
{
  "text": "I need help with dispatching",
  "userType": "trucker", 
  "language": "en",
  "sessionId": "session_123"
}

// Get user profile
GET /api/user/profile
Headers: { "X-Session-ID": "session_123" }
```

## 🌍 Multilingual Support

### Supported Languages
- **English (en)**: Default language
- **Spanish (es)**: Full translation support
- **Urdu (ur)**: Complete RTL support
- **Chinese (zh)**: Simplified Chinese support

### Adding New Languages
1. Add language code to `SUPPORTED_LANGUAGES` in types
2. Add translations to `translationService.js`
3. Update language selector component
4. Test with sample conversations

## 🤖 NLP Configuration

### OpenAI Integration
```bash
# Enable OpenAI for advanced responses
OPENAI_API_KEY=your_api_key
USE_OPENAI=true
```

### Custom Intent Patterns
Edit `server/services/nlpService.js` to add new intents:

```javascript
this.intentPatterns = {
  custom_intent: [
    'keyword1', 'keyword2', 'phrase pattern'
  ],
  // ... other intents
};
```

## 📊 Analytics & Monitoring

### Analytics Dashboard
Access comprehensive analytics at:
- Development: http://localhost:5000/api/analytics/overview
- Requires admin authentication via `X-Admin-Key` header

### Key Metrics
- User engagement and conversion rates
- Message volume and response times  
- Lead qualification statistics
- Language and intent distribution
- User satisfaction scores

### Real-time Monitoring
```bash
# Get real-time statistics
GET /api/analytics/real-time
Headers: { "X-Admin-Key": "your_admin_key" }
```

## 🔧 Configuration

### Chatbot Behavior
Customize responses in `server/services/nlpService.js`:

```javascript
this.responses = {
  en: {
    trucker: {
      dispatching: "Custom response for truckers...",
      // ... other responses
    }
  }
};
```

### UI Customization
Modify styling in React components:

```javascript
const ChatContainer = styled.div`
  // Customize colors, fonts, positioning
  background: #your-brand-color;
`;
```

## 🔐 Security

### Authentication
- Session-based user identification
- Admin API key protection
- Rate limiting on all endpoints
- Input validation and sanitization

### Data Privacy
- GDPR compliant data handling
- User data deletion endpoints
- Conversation history controls
- Secure data transmission

## 🚀 Deployment

### Production Deployment

#### Using PM2 (Recommended)
```bash
# Install PM2
npm install -g pm2

# Build application
npm run build

# Start with PM2
pm2 start server/index.js --name chatbot

# Setup auto-restart
pm2 startup
pm2 save
```

#### Using Docker
```dockerfile
# Dockerfile included in repository
docker build -t smartroute-chatbot .
docker run -p 5000:5000 smartroute-chatbot
```

### Environment Variables (Production)
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://production-server:27017/chatbot
CLIENT_URL=https://yourdomain.com
OPENAI_API_KEY=your_production_key
```

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd server && npm test

# Frontend tests  
cd client && npm test
```

### Test Coverage
```bash
npm run test:coverage
```

## 📚 API Documentation

### Chat Endpoints
- `POST /api/chat/message` - Send message to chatbot
- `GET /api/chat/history` - Get conversation history
- `GET /api/chat/suggestions` - Get quick reply suggestions

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `DELETE /api/user/data` - Delete user data (GDPR)

### Translation
- `POST /api/translate` - Translate text
- `POST /api/translate/detect-language` - Detect language
- `GET /api/translate/languages` - Get supported languages

### Analytics (Admin)
- `GET /api/analytics/overview` - General analytics
- `GET /api/analytics/conversations` - Conversation analytics  
- `GET /api/analytics/leads` - Lead analytics
- `GET /api/analytics/performance` - Performance metrics

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Standards
- TypeScript for frontend
- ESLint + Prettier for code formatting
- Jest for testing
- Conventional commits

## 📞 Support

### Technical Support
- Email: support@smartroutelogistics.com
- Phone: +1-800-SMARTROUTE
- Documentation: [Link to docs]

### Business Support
- Sales inquiries: sales@smartroutelogistics.com
- Partnerships: partnerships@smartroutelogistics.com

## 📄 License

This project is proprietary software owned by SmartRoute Logistics. All rights reserved.

## 🔄 Changelog

### Version 1.0.0 (Current)
- Initial release
- Full multilingual support
- Advanced NLP integration
- Real-time chat capabilities
- Analytics dashboard
- Lead qualification system

---

**Made with ❤️ for SmartRoute Logistics**

*Empowering truckers and shippers with intelligent automation*