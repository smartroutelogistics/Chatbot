# Repository Guidelines

## Project Structure & Module Organization
- Root: `client/` (React + TypeScript) and `server/` (Node + Express). Shared scripts live in root `package.json`.
- Client: `src/components/`, `src/hooks/`, `src/services/`, `src/styles/`, `public/`. Entry: `src/index.tsx`, app shell: `src/App.tsx`.
- Server: `routes/` (REST endpoints), `services/` (NLP/translation), `socket/` (Socket.IO), `config/database.js`, `models/`, `index.js`.
- Environment: `server/.env` and `client/.env` (use `*.env.example` as templates). Do not commit secrets.

## Build, Test, and Development Commands
- Root dev (runs both): `npm run dev` (client 3000, server 5000 via concurrently).
- Install all: `npm run install-all` (root, client, server).
- Client: `npm start`, `npm run build`, `npm test`.
- Server: `npm run dev` (nodemon), `npm start` (prod), `npm test` (Jest).
- Production hint: build client (`npm run build`) then start server (`npm start`). CRA proxy targets `http://localhost:5000`.

## Coding Style & Naming Conventions
- Indentation: 2 spaces; use trailing commas where supported; prefer const/let over var.
- Frontend: TypeScript; React components in PascalCase (e.g., `ChatHeader.tsx`), hooks in camelCase (e.g., `useChat.ts`).
- Backend: JavaScript (ES2020+); files kebab-case (e.g., `translation-service.js`), functions/variables camelCase.
- Lint/format: CRA ESLint preset on client; use Prettier if installed. Suggested: `npx prettier --write "client/src/**/*.{ts,tsx}" "server/**/*.js"`.

## Testing Guidelines
- Frameworks: Jest on server; CRA + React Testing Library on client.
- Locations: client tests as `src/**/*.test.tsx`; server tests as `__tests__/**/*.test.js` or co-located next to modules.
- Run: `cd server && npm test`; `cd client && npm test`. Aim for >80% coverage on changed code.

## Commit & Pull Request Guidelines
- Commits: follow Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`). Keep messages imperative and scoped (e.g., `feat(chat): add typing indicator`).
- PRs: include clear description, linked issues, test plan/steps, and screenshots for UI changes. Ensure `npm test` passes in `client` and `server`.

## Security & Configuration Tips
- Configure `MONGODB_URI`, `OPENAI_API_KEY`, `CLIENT_URL`, `PORT` in `server/.env`; mirror client runtime vars in `client/.env` as needed.
- CORS/rate-limits are enabled; avoid weakening in production. Never log secrets. Validate inputs on new routes.

