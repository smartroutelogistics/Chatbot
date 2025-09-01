# DNS Setup

Configure the following records at your DNS provider.

## Production
- `widget.smartroutelogistics.com` → A/AAAA → server public IP (NGINX + Node)
- `chat.smartroutelogistics.com` → A/AAAA → same server (proxies API + serves SPA)

## Staging (Optional)
- `widget-staging.smartroutelogistics.com` → A/AAAA → staging server IP
- `chat-staging.smartroutelogistics.com` → A/AAAA → staging server IP

## Recommendations
- TTL: 300s during rollout; increase to 3600s when stable
- Ensure ports 80 and 443 are open to the host
- After DNS propagates, request certs using `deployment/certbot/init.sh`

