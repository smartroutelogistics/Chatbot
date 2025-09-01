#!/usr/bin/env bash
set -euo pipefail

# Issue/renew certificates for widget + chat domains using webroot.
# Pre-req: nginx container running and serving /.well-known/acme-challenge/ from /var/www/certbot
# Usage: DOMAIN_PRIMARY=widget.smartroutelogistics.com OTHER_DOMAINS=chat.smartroutelogistics.com EMAIL=admin@smartroutelogistics.com ./init.sh

DOMAIN_PRIMARY=${DOMAIN_PRIMARY:-widget.smartroutelogistics.com}
OTHER_DOMAINS=${OTHER_DOMAINS:-chat.smartroutelogistics.com}
EMAIL=${EMAIL:-admin@smartroutelogistics.com}

DOMAINS=(-d "$DOMAIN_PRIMARY")
for d in $OTHER_DOMAINS; do
  DOMAINS+=( -d "$d" )
done

docker compose run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  --email "$EMAIL" --agree-tos --no-eff-email \
  ${DOMAINS[@]}

echo "Certificates requested. Reloading nginx..."
docker compose exec nginx nginx -s reload || true

