# CMMC Readiness Platform

A self-hosted CMMC 2.0 Level 2 readiness platform for compliance consultancies, MSPs, RPOs, and defense contractors.

This repository includes a secure production-oriented foundation for multi-tenant compliance operations, with strict organizational isolation, source-aware compliance data, AI-assisted guidance, and read-only Microsoft 365 and Google Workspace connectors.

## Product Goal

Create a self-hosted software platform that allows organizations to:

- Run guided CMMC Level 2 readiness assessments
- Track practice status with clear source attribution (`ai`, `connector`, `manual`)
- Manage evidence and POA&Ms
- Generate SSP and POA&M drafts with human review
- Connect read-only to Microsoft 365 and Google Workspace
- Maintain an immutable audit trail
- Support multi-user organizations with invitations and roles

This repository is intended for owned deployment, not SaaS operation.

## Current Status

The project is scaffolded and includes the foundational backend architecture, authentication flow, migration system, assessment framework, and a static professional frontend shell.

## Tech Stack

- Backend: Node.js + Express
- Database: PostgreSQL
- Frontend: Vanilla JS + HTML + CSS
- AI: Anthropic Claude API (backend-only)
- Auth: JWT
- Connectors: Microsoft Graph + Google Admin SDK (read-only)

## Core Features Included

- Organization and user model with JWT auth
- Invitation system for multi-user access
- Role-based authorization with admin/member enforcement
- Assessment and practice status tracking with immutable source rules
- AI summaries and document generation hooks with backend-only API calls
- Evidence registry and POA&M management
- SSP and POA&M draft generation with review gate
- Encrypted connector token storage
- Immutable audit logging
- Health checks and rate limiting
- Clean static frontend shell with dashboard and module pages

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create PostgreSQL database:
   ```bash
   createdb cmmc_readiness_dev
   ```

3. Copy environment values:
   ```bash
   cp .env.example .env
   ```

4. Update the values in `.env` to match your environment.

5. Run migrations:
   ```bash
   npm run migrate
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open `http://localhost:4000` in your browser.

## Environment Variables

The project reads the following values from `.env`:

- `PORT`
- `NODE_ENV`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLAUDE_API_KEY`
- `M365_CLIENT_ID`
- `M365_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `ENCRYPTION_KEY`

## Project Structure

- `src/app.js` – Express app and middleware setup
- `src/server.js` – server bootstrap
- `src/config` – runtime and database configuration
- `src/middleware` – auth and error handling
- `src/routes` – API endpoints for auth, assessments, documents, connectors, and org tools
- `src/services` – backend business services for AI and connectors
- `src/utils` – audit, encryption, and validation helpers
- `src/db/migrations` – numbered PostgreSQL migrations
- `public` – frontend UI shell

## Primary API Areas

- `/api/auth` – register, login, and invitations
- `/api/organizations` – team and invitations management
- `/api/assessments` – assessment creation, status updates, and AI interview support
- `/api/evidence` – evidence management
- `/api/poam` – POA&M tracking
- `/api/documents` – SSP and POA&M generation with review gate
- `/api/connectors` – read-only M365 and Google connector management
- `/health` – service health check

## Security Rules Implemented

- Backend-owned AI calls only
- JWT auth with organization-scoped access
- Source integrity enforcement for compliance status values
- No API keys exposed to the frontend
- Encrypted connector token storage
- Immutable audit logging
- Role-based access checks

## Roadmap Status

1. Project setup + Express + PostgreSQL + migration system – complete
2. Auth + Organizations + Invitations – complete
3. Assessment + Status models – complete
4. AI interview + scoring – implemented via backend service layer
5. Document generation + review gate – implemented in APIs and data model
6. Evidence + POA&M – implemented in API layer
7. Microsoft connector – implemented with read-only connector architecture
8. Google connector – implemented with read-only connector architecture
9. Frontend – static dashboard and screens created
10. Rate limiting + health check + hardening – implemented
11. Critical tests – next phase
12. README and final polish – ongoing

## Notes

The platform keeps compliance source-of-truth rules strict: AI updates cannot override connector or manual status values. Human review is required before final document approval.
