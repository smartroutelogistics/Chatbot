# Staging Environment

Use staging subdomains for pre-production testing.

## Suggested Domains
- Widget: `widget-staging.smartroutelogistics.com`
- Chat UI/API: `chat-staging.smartroutelogistics.com`

## NGINX Config
Copy `deployment/nginx/https.staging.conf` to your server and enable it. It mirrors the production config with `-staging` subdomains.

## Certificates
Issue SAN certificates including both production and staging, or issue separate certs per domain. With the provided script:
```
DOMAIN_PRIMARY=widget-staging.smartroutelogistics.com \
OTHER_DOMAINS="chat-staging.smartroutelogistics.com" \
EMAIL=admin@smartroutelogistics.com \
deployment/certbot/init.sh
```

## Environment
Set in `server/.env` on your staging host:
```
NODE_ENV=production
CLIENT_URL=https://chat-staging.smartroutelogistics.com
WIDGET_URL=https://widget-staging.smartroutelogistics.com
ALLOWED_IFRAME_ORIGINS=https://www.smartroutelogistics.com https://smartroutelogistics.com
```

## DNS
Point both staging subdomains to your staging server’s public IP.

