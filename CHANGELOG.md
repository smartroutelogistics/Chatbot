# Changelog

All notable changes to this project will be documented in this file.

## [v1.0.0] - 2025-09-01
- Embeddable widget served at `/widget.js` with 1y immutable cache
- Production SPA serving from `client/build` via Express
- Hardened CORS and CSP (iframe `frame-ancestors`)
- Docker Compose with NGINX reverse proxy (HTTP/HTTPS)
- Certbot scripts for TLS issue/renew
- GitHub Actions: CI (build/test), Docker image publish, Pages docs
- Documentation site via GitHub Pages under `docs/`

[Unreleased]: https://github.com/smartroutelogistics/Chatbot/compare/v1.0.0...main
[v1.0.0]: https://github.com/smartroutelogistics/Chatbot/releases/tag/v1.0.0
