---
title: SmartRoute Chatbot
layout: default
---

# SmartRoute Logistics Chatbot

Welcome to the documentation for the SmartRoute Chatbot. This guide covers local development, production deployment, and website embedding.

## Quick Start
- Install: `npm run install-all`
- Dev: `npm run dev` (client: `http://localhost:3000`, server: `http://localhost:5000`)
- Health: `GET http://localhost:5000/health`

## Embed on Your Site
Add this snippet to your site’s footer to load the widget and open the chat UI in an iframe:
```html
<script src="https://widget.smartroutelogistics.com/widget.js"
        data-chat-url="https://chat.smartroutelogistics.com"
        data-button-text="Chat with SmartRoute"
        data-primary="#0ea5e9"
        defer></script>
```

## Production Deployment (Docker Compose)
1. Copy `server/.env.example` → `server/.env` and set values: `MONGODB_URI`, `OPENAI_API_KEY`, `CLIENT_URL`, `WIDGET_URL`, `ALLOWED_IFRAME_ORIGINS`.
2. Start: `docker compose up -d` (starts NGINX + API with HTTP/HTTPS).
3. Issue TLS certs: `deployment/certbot/init.sh` (see comments inside for usage).

## Repositories & Releases
- Code: https://github.com/smartroutelogistics/Chatbot
- Releases: https://github.com/smartroutelogistics/Chatbot/releases

## More Docs
- Contributor guide: `AGENTS.md`
- Deployment: `deployment-guide.md`
- Frontend quickstart: `FRONTEND-QUICKSTART.md`

