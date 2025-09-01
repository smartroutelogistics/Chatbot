# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Root Level Commands
- `npm run dev` - Run both client and server concurrently in development mode
- `npm run install-all` - Install dependencies for root, client, and server
- `npm run build` - Build the React client for production
- `npm start` - Start the server in production mode
- `npm run server` - Start only the backend server
- `npm run client` - Start only the React frontend

### Client Commands (React Frontend)
- `cd client && npm start` - Start development server (http://localhost:3000)
- `cd client && npm run build` - Build production bundle
- `cd client && npm test` - Run React tests

### Server Commands (Node.js Backend)
- `cd server && npm run dev` - Start with nodemon for development
- `cd server && npm start` - Start production server
- `cd server && npm test` - Run Jest tests

### Docker Commands
- `docker-compose up -d` - Run full stack with MongoDB in Docker
- `docker-compose down` - Stop all Docker services
- `docker-compose logs -f` - View logs from all services

## Architecture Overview

### Frontend (React + TypeScript)
- **Main App**: `client/src/App.tsx` - Root component with chatbot widget
- **Chat Context**: `client/src/contexts/ChatContext.tsx` - Central state management using useReducer pattern for messages, user sessions, language preferences, and real-time communication state
- **Socket Hook**: `client/src/hooks/useChatSocket.ts` - WebSocket connection management and real-time messaging
- **Components**: Modular chat components in `client/src/components/` including:
  - `Chatbot.tsx` - Main chat container component
  - `MessageList.tsx` - Message display and rendering
  - `MessageInput.tsx` - User input with typing indicators
  - `LanguageSelector.tsx` - Multi-language support UI
  - `WelcomeScreen.tsx`, `QuickActions.tsx` - User onboarding and interaction aids
- **Styling**: Styled-components with centralized theme system at `client/src/styles/theme.ts`
- **Types**: Comprehensive TypeScript interfaces in `client/src/types/index.ts` for type safety

### Backend (Node.js + Express)
- **Main Server**: `server/index.js` - Express server with Socket.IO setup, MongoDB connection, security middleware (Helmet, CORS, rate limiting), and error handling
- **Socket Handler**: `server/socket/socketHandler.js` - Core real-time communication logic with user identification, message processing, typing indicators, and live agent escalation
- **NLP Service**: `server/services/nlpService.js` - Advanced natural language processing with:
  - Intent detection using pattern matching
  - Emotion/sentiment analysis using the Sentiment library
  - OpenAI GPT integration for sophisticated responses
  - Multi-language support (EN, ES, UR, ZH)
  - SmartRoute Logistics-specific business logic
- **Routes**: RESTful APIs in `server/routes/` for chat, user management, analytics, translation, and feedback
- **Models**: MongoDB schemas in `server/models/` with Mongoose ODM
- **Database**: MongoDB with user profiles, conversation history, and analytics data

### Key Integration Points
- **Real-time Communication**: Socket.IO handles bidirectional chat with events like 'user_message', 'bot_message', 'typing', 'identify', 'request_live_agent'
- **State Management**: React Context API with useReducer pattern manages chat state, user sessions, language preferences, and message history
- **Session Management**: Automatic session creation with localStorage persistence and MongoDB user profile synchronization
- **Multilingual Support**: Built-in support for English, Spanish, Urdu, and Chinese with auto-detection and real-time translation
- **NLP Processing**: Intent detection for logistics-specific queries (dispatching, factoring, brokerage, pricing, support, signup)
- **User Tracking**: Session-based user identification with conversation history, lead scoring, and automatic preference saving
- **Live Agent Escalation**: Automatic escalation logic based on confidence scores, emotion analysis, and user qualification status

### Configuration Files
- `server/.env` - Backend environment variables (MongoDB URI, OpenAI API key, admin keys, USE_OPENAI flag)
- `client/.env` - Frontend environment variables (API URLs, Socket endpoints)
- `docker-compose.yml` - Full stack deployment with MongoDB, API server, and Nginx reverse proxy
- `package.json` files at root, client, and server levels with scripts and dependency management
- Client proxy configured to `http://localhost:5000` for development

### Database Schema
- **Users**: Session-based profiles with user type (trucker/shipper/visitor), preferences (language, theme, notifications), conversation history, and lead qualification data with scoring
- **Messages**: Stored with intent detection, confidence scores, emotion analysis, language, and sender information
- **Analytics**: User engagement tracking, conversation metrics, and real-time statistics

### Security Features
- Helmet.js security headers with CSP configuration
- CORS configuration for cross-origin requests with specific allowed origins and methods
- Express rate limiting (100 requests/15min in production, 1000 in development)
- Input validation and sanitization with message length limits (500 chars max)
- Admin API key protection for analytics endpoints via X-Admin-Key header
- JSON payload size limits (10mb) and request logging middleware

### Logistics Business Logic
The chatbot is specifically designed for SmartRoute Logistics with:
- **User Types**: Truckers vs Shippers with different conversation flows and tailored responses
- **Service Categories**: Dispatching (3-5% rates), Factoring (quick payment solutions), Brokerage (freight matching)
- **Intent Recognition**: Specialized patterns for logistics industry terms (load board, freight, factoring, MC numbers, etc.)
- **Lead Qualification**: Automatic scoring based on user interactions, intent detection, and engagement level
- **Escalation Logic**: Smart routing to live agents based on confidence scores (<0.4), negative emotions (angry/frustrated), support requests, and high-value leads (score >80)

## Common Development Tasks

### Adding New Intents to NLP Service
1. Update `intentPatterns` object in `server/services/nlpService.js` with new keywords
2. Add corresponding responses in the `responses` object for each language and user type
3. Update `getSuggestedActions` method to provide relevant quick actions
4. Consider adding intent-specific lead scoring in `server/socket/socketHandler.js` (intentScores object)

### Modifying UI Components  
1. Components use styled-components for styling with theme integration
2. Theme variables are centralized in `client/src/styles/theme.ts`
3. All animations use Framer Motion for smooth interactions
4. TypeScript interfaces in `client/src/types/index.ts` ensure type safety

### Database Schema Changes
1. Models are in `server/models/` directory using Mongoose ODM
2. User model handles conversation history, preferences, and lead data
3. Use Mongoose methods like `user.addMessage()` and `user.updateLeadScore()` for data operations
4. Session-based identification rather than traditional user accounts

### Adding New Languages
1. Update `SUPPORTED_LANGUAGES` constant in `client/src/types/index.ts`
2. Add translations to `server/services/nlpService.js` responses object (nested by language and user type)
3. Update translation service methods in `server/services/translationService.js`
4. Add language-specific quick actions and UI translations

### Socket Event Handling
1. Socket events are handled in `server/socket/socketHandler.js`
2. Key events: 'identify', 'user_message', 'request_live_agent', 'change_language'
3. Client-side socket connection managed through `client/src/hooks/useChatSocket.ts`
4. Real-time typing indicators and message delivery confirmation