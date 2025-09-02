const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/database');
const chatRoutes = require('./routes/chat');
const userRoutes = require('./routes/user');
const translateRoutes = require('./routes/translate');
const analyticsRoutes = require('./routes/analytics');
const feedbackRoutes = require('./routes/feedback');
const liveChatRoutes = require('./routes/liveChat');
const socketHandler = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);
app.set('trust proxy', 1); // behind NGINX/any reverse proxy

// CORS configuration
const devOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
const prodOrigins = [
  process.env.CLIENT_URL,
  process.env.WIDGET_URL,
  process.env.CHAT_URL,
  'https://www.smartroutelogistics.com',
  'https://smartroutelogistics.com',
  'https://chat.smartroutelogistics.com',
  'https://widget.smartroutelogistics.com'
].filter(Boolean);

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? prodOrigins : devOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-ID']
};

// Socket.IO setup
const io = socketIo(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling']
});

// Connect to MongoDB
connectDB();

// Security middleware
const isProd = (process.env.NODE_ENV === 'production');
const frameAncestors = (process.env.ALLOWED_IFRAME_ORIGINS || 'https://www.smartroutelogistics.com https://smartroutelogistics.com')
  .split(/[,\s]+/)
  .filter(Boolean);

app.use(helmet({
  contentSecurityPolicy: isProd ? {
    useDefaults: true,
    directives: {
      'frame-ancestors': frameAncestors,
    }
  } : false,
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Limit each IP
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(compression());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static assets (e.g., widget.js) with long-term caching
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1y',
  immutable: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }
  }
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/user', userRoutes);
app.use('/api/translate', translateRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/live-chat', liveChatRoutes);

// Explicit widget route with cache headers (served from server/public/widget.js)
app.get('/widget.js', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.sendFile(path.join(__dirname, 'public', 'widget.js'));
});

// Dynamic widget configuration
app.get('/widget.json', (req, res) => {
  const cfg = {
    chatUrl: process.env.WIDGET_CHAT_URL || process.env.CLIENT_URL || '',
    buttonText: process.env.WIDGET_BUTTON_TEXT || 'Chat with SmartRoute',
    primary: process.env.WIDGET_PRIMARY || '#0ea5e9',
    position: (process.env.WIDGET_POSITION || 'right'),
    offsetX: process.env.WIDGET_OFFSET_X || '24px',
    offsetY: process.env.WIDGET_OFFSET_Y || '24px',
    width: process.env.WIDGET_WIDTH || '380px',
    height: process.env.WIDGET_HEIGHT || '560px',
    radius: process.env.WIDGET_RADIUS || '12px',
    shadow: process.env.WIDGET_SHADOW || '0 10px 28px rgba(0,0,0,.18)',
    font: process.env.WIDGET_FONT || '600 14px/1.2 Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif',
    zIndex: Number(process.env.WIDGET_Z_INDEX || 2147483640),
    icon: process.env.WIDGET_ICON || '',
    open: String(process.env.WIDGET_OPEN || 'false').toLowerCase() === 'true',
    greeting: process.env.WIDGET_GREETING || '',
    closeOnEscape: String(process.env.WIDGET_CLOSE_ON_ESCAPE || 'true').toLowerCase() !== 'false'
  };
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.json(cfg);
});

// Socket.IO connection handling
socketHandler(io);

// Serve React SPA in production (client/build)
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '..', 'client', 'build');
  app.use(express.static(clientBuildPath));
  // Serve SPA for non-API routes
  app.get(/^\/(?!api|health|widget\.js).*/, (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Invalid JSON payload'
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.message
    });
  }

  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error'
      : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 SmartRoute Chatbot Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
