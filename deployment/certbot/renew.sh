#!/usr/bin/env bash
set -euo pipefail

# Renew certificates (should be run monthly via cron or GitHub Actions self-hosted runner)
docker compose run --rm certbot renew --webroot -w /var/www/certbot --quiet
docker compose exec nginx nginx -s reload || true

