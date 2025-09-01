# SmartRoute Logistics Chatbot - Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB 5.0+
- Git

### 1. Installation
```bash
git clone <repository-url>
cd chatbot
npm run install-all
```

### 2. Configuration
```bash
# Server configuration
cp server/.env.example server/.env
# Edit server/.env with your settings

# Client configuration  
cp client/.env.example client/.env
# Edit client/.env with your settings
```

### 3. Database Setup
```bash
# Start MongoDB
# Default connection: mongodb://localhost:27017/smartroute-chatbot
```

### 4. Development
```bash
npm run dev
```
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)
```bash
# Create environment file
cp .env.example .env
# Edit .env with production values

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Docker Build
```bash
# Build backend
cd server
docker build -t smartroute-chatbot-api .

# Build frontend
cd ../client
npm run build

# Run with docker
docker run -d -p 5000:5000 smartroute-chatbot-api
```

## ☁️ Production Deployment

### Environment Variables (Required)
```bash
# Server (.env)
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://username:password@host:port/database
ADMIN_API_KEY=secure-random-key-here
OPENAI_API_KEY=your-openai-key (optional)

# Client (.env) 
REACT_APP_API_URL=https://your-api-domain.com/api
REACT_APP_SOCKET_URL=https://your-api-domain.com
```

### Using PM2 (Production Process Manager)
```bash
# Install PM2
npm install -g pm2

# Build frontend
cd client && npm run build

# Start backend with PM2
cd ../server
pm2 start ecosystem.config.js

# Setup auto-restart
pm2 startup
pm2 save

# Monitor
pm2 monit
```

### Using Nginx (Reverse Proxy)
```nginx
# /etc/nginx/sites-available/chatbot
server {
    listen 80;
    server_name your-domain.com;

    # Serve React app
    location / {
        root /path/to/chatbot/client/build;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO proxy
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔧 Configuration Options

### Chatbot Behavior
Edit `server/services/nlpService.js`:
```javascript
// Add custom intents
this.intentPatterns = {
  custom_service: ['keyword1', 'keyword2'],
  // ... existing intents
};

// Add custom responses
this.responses = {
  en: {
    trucker: {
      custom_service: "Your custom response here...",
      // ... existing responses
    }
  }
};
```

### Styling Customization
Edit `client/src/components/Chatbot.tsx`:
```javascript
const ChatContainer = styled.div`
  // Customize positioning
  bottom: 20px;
  right: 20px;
  
  // Customize colors
  background: #your-brand-color;
`;
```

### API Endpoints
Base URL: `http://localhost:5000/api`

Key endpoints:
- `POST /chat/message` - Send message
- `GET /user/profile` - User profile
- `POST /translate` - Translation
- `GET /analytics/overview` - Analytics (admin)

## 📊 Monitoring & Analytics

### Health Checks
```bash
# Application health
curl http://localhost:5000/health

# Database connection
curl http://localhost:5000/api/analytics/real-time \
  -H "X-Admin-Key: your-admin-key"
```

### Log Management
```bash
# PM2 logs
pm2 logs chatbot

# Docker logs
docker-compose logs -f chatbot-api

# Application logs
tail -f server/logs/application.log
```

### Analytics Dashboard
Access admin analytics:
```bash
curl http://localhost:5000/api/analytics/overview \
  -H "X-Admin-Key: your-admin-key"
```

## 🔒 Security Checklist

### Production Security
- [ ] Change default ADMIN_API_KEY
- [ ] Use HTTPS with SSL certificates
- [ ] Configure MongoDB authentication
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Regular security updates

### Environment Variables
```bash
# Generate secure keys
openssl rand -base64 32  # For ADMIN_API_KEY
openssl rand -base64 32  # For SESSION_SECRET
```

## 🚨 Troubleshooting

### Common Issues

#### 1. "Connection to MongoDB failed"
```bash
# Check MongoDB service
systemctl status mongod

# Check connection string
mongo mongodb://localhost:27017/smartroute-chatbot
```

#### 2. "CORS error in browser"
```bash
# Verify CLIENT_URL in server/.env
CLIENT_URL=http://localhost:3000  # Development
CLIENT_URL=https://yourdomain.com  # Production
```

#### 3. "OpenAI API errors"
```bash
# Verify API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer your-api-key"

# Disable OpenAI if not needed
USE_OPENAI=false
```

#### 4. "Socket connection failed"
```bash
# Check Socket.IO endpoint
# Development: ws://localhost:5000
# Production: wss://yourdomain.com
```

### Performance Issues

#### High Memory Usage
```bash
# Monitor with PM2
pm2 monit

# Adjust Node.js memory
NODE_OPTIONS="--max-old-space-size=512" pm2 restart chatbot
```

#### Slow Response Times
```bash
# Check MongoDB indexes
db.users.getIndexes()

# Monitor API response times
curl -w "@curl-format.txt" http://localhost:5000/health
```

## 📈 Scaling

### Horizontal Scaling
```bash
# Run multiple instances
pm2 start ecosystem.config.js -i max

# Load balancer configuration (Nginx)
upstream chatbot_api {
    server localhost:5000;
    server localhost:5001;
    server localhost:5002;
}
```

### Database Scaling
```javascript
// MongoDB replica set
mongodb://user:pass@host1:27017,host2:27017,host3:27017/database?replicaSet=rs0

// Connection pooling
mongoose.connect(uri, {
  maxPoolSize: 10,
  bufferMaxEntries: 0
});
```

## 🔄 Updates & Maintenance

### Update Process
```bash
# 1. Backup database
mongodump --db smartroute-chatbot --out backup/

# 2. Update code
git pull origin main
npm run install-all

# 3. Build frontend
cd client && npm run build

# 4. Restart services
pm2 restart chatbot

# 5. Verify deployment
curl http://localhost:5000/health
```

### Regular Maintenance
```bash
# Clean old logs
find server/logs -name "*.log" -mtime +30 -delete

# Update dependencies
npm audit fix

# Database maintenance
db.users.deleteMany({ "analytics.lastActivity": { $lt: ISODate("2023-01-01") } })
```

## 📞 Support

### Technical Issues
- Check logs first: `pm2 logs` or `docker-compose logs`
- Verify environment variables
- Test API endpoints manually
- Check MongoDB connectivity

### Getting Help
- Documentation: See README.md
- API Reference: Use /health endpoint
- Support: support@smartroutelogistics.com

---

**Deployment completed successfully! 🎉**

Your SmartRoute Logistics chatbot is now ready to serve customers with intelligent, multilingual support.