# CMMC Readiness Platform

A self-hosted CMMC 2.0 Level 2 readiness platform designed for compliance consultancies, MSPs, RPOs, and defense contractors.

This repository is being built in phases, starting with the infrastructure needed to support a secure, multi-tenant compliance application.

## Current Phase

Phase 1: project scaffolding, Express bootstrap, PostgreSQL connectivity, and a numbered migration system.

## Tech Stack

- Backend: Node.js + Express
- Database: PostgreSQL
- Frontend: Vanilla JS + HTML + CSS
- AI: Anthropic Claude API
- Auth: JWT
- Connectors: Microsoft Graph + Google Admin SDK (read-only)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a PostgreSQL database:
   ```bash
   createdb cmmc_readiness_dev
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Update the database and JWT values in `.env`.

5. Run migrations:
   ```bash
   npm run migrate
   ```

6. Start the app:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:4000`.

## Project Layout

- `src/app.js` – Express application setup
- `src/server.js` – server bootstrap
- `src/config` – environment and database config
- `src/db` – migration runner and migration files
- `src/routes` – API route modules

## Roadmap

1. Auth + organizations + invitations
2. Assessment + status models
3. AI interview + scoring
4. Document generation + review gate
5. Evidence + POA&M
6. Microsoft connector
7. Google connector
8. Frontend dashboard and screens
9. Rate limiting + health check + hardening
10. Tests and release polish

## Notes

This project intentionally keeps AI and connector logic on the backend only and preserves source-of-truth rules for compliance data.
