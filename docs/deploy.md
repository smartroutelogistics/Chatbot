# Deployment (Production)

## Prerequisites
- Linux host with Docker + Docker Compose v2
- DNS A records for:
  - widget.smartroutelogistics.com
  - chat.smartroutelogistics.com
- Ports 80 and 443 open

## Environment
1. Copy `server/.env.example` to `server/.env` and set:
   - NODE_ENV=production
   - PORT=5000
   - MONGODB_URI, OPENAI_API_KEY (optional)
   - CLIENT_URL=https://www.smartroutelogistics.com
   - WIDGET_URL=https://widget.smartroutelogistics.com
   - ALLOWED_IFRAME_ORIGINS=https://www.smartroutelogistics.com https://smartroutelogistics.com

## Start Stack
```
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## TLS Certificates
```
DOMAIN_PRIMARY=widget.smartroutelogistics.com \
OTHER_DOMAINS="chat.smartroutelogistics.com" \
EMAIL=admin@smartroutelogistics.com \
deployment/certbot/init.sh
```
Renew monthly:
```
deployment/certbot/renew.sh
```

## CI/CD Deploy (SSH)
Configure repo secrets:
- DEPLOY_HOST, DEPLOY_USER, DEPLOY_KEY, DEPLOY_PATH, (optional DEPLOY_PORT)
- GHCR_USERNAME, GHCR_TOKEN (PAT with read:packages)

Run workflow: Actions → Deploy to Server (SSH) → Run workflow.

