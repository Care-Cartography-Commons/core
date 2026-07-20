# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

For project specification, please refer to the `spec.md` file in the root of the repository.

## Project Overview

Care Cartography Commons is a QR-based feedback collection system that transforms user ratings into generative artwork. The system consists of:

- **Frontend apps**: User-facing rating interface (React/Vite)
- **Artwork apps**: p5.js and paper.js based generative artwork renderers
- **Backend API**: FastAPI server with PostgreSQL database, WebSocket support for real-time data updates
- **Admin interface**: For managing institutions and viewing data

## Development Environment Setup

1. **Environment Variables**:
   ```bash
   cp .env.example .env
   # Edit .env with appropriate values
   ```

2. **Start Development Environment**:
   ```bash
   pnpm dev
   ```
   This starts the PostgreSQL database via Docker Compose and runs all apps in parallel using Turbo.

3. **Database Only**:
   ```bash
   pnpm db:start   # Start PostgreSQL + Adminer
   pnpm db:stop    # Stop database containers
   pnpm db:logs    # View database logs
   ```

4. **Seed Database**:
   ```bash
   cd packages/api
   python seed_db.py
   ```

## Common Commands

### Monorepo Commands (from root)

- `pnpm dev` - Start all services (database + all apps in parallel)
- `pnpm build` - Build all packages using Turbo
- `pnpm lint` - Lint all packages
- `pnpm format` - Format code with Prettier
- `pnpm check-types` - Type check all TypeScript packages

### Backend API (Python/FastAPI)

From `packages/api/`:

- `python -m care_cartography_api` - Run the API server (default port 8000)
- `python seed_db.py` - Seed database with test data
- `pip install -e .` - Install API dependencies in editable mode
- `pip install -e ".[dev]"` - Install with dev dependencies (ruff, black)

### Database Migrations (Alembic)

From `packages/api/`:

- `alembic revision --autogenerate -m "Description"` - Create new migration
- `alembic upgrade head` - Apply all migrations
- `alembic downgrade -1` - Rollback one migration

### Frontend Apps

Each app in `apps/` has standard Vite commands:

- `pnpm dev` - Start dev server with hot reload
- `pnpm build` - Build for production
- `pnpm lint` - Lint the app

## Architecture

### Monorepo Structure

```
apps/
├── frontend/         # User rating interface (React + Vite)
├── artwork/          # p5.js artwork renderer
└── artwork_display/  # paper.js artwork display

packages/
└── api/             # FastAPI backend with SQLAlchemy models
```

### Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Artwork**: p5.js and paper.js for generative visuals
- **Backend**: FastAPI, SQLAlchemy, Pydantic
- **Database**: PostgreSQL with Alembic migrations
- **Monorepo**: Turborepo with pnpm workspaces
- **Containerization**: Docker Compose for PostgreSQL

### Database Schema

**institutions** table:
- `id` (String, PK) - Institution identifier
- `name` (String) - Institution name
- `created_at` (DateTime) - Creation timestamp

**ratings** table:
- `id` (Integer, PK) - Auto-incrementing ID
- `institution_id` (String, FK → institutions.id)
- `rating` (Integer) - Rating value (1-3)
- `created_at` (DateTime) - Creation timestamp

### API Architecture

The FastAPI backend (`packages/api/src/care_cartography_api/__main__.py`) provides:

- **REST endpoints**:
  - `POST /api/ratings/submit` - Submit new rating
  - `GET /api/data` - Fetch all institutions with ratings

- **WebSocket endpoint**:
  - `WS /api/data/ws` - Real-time data updates via WebSocket broadcast
  - ConnectionManager handles multiple WebSocket connections
  - Broadcasts data to all connected clients when new ratings submitted

- **Database**:
  - SQLAlchemy ORM with models in `packages/api/src/care_cartography_api/models.py`
  - Database connection via `get_db()` dependency injection
  - Tables auto-created on startup via lifespan event

- **CORS**: Enabled for all origins in development, restricted in production

### Database Access

- **Adminer UI**: http://localhost:8080
  - System: PostgreSQL
  - Server: `db`
  - Database: `care_cartography`
  - Credentials: Use values from `.env`

## Data Flow

1. User scans QR code → Opens frontend rating interface
2. User submits rating → `POST /api/ratings/submit`
3. Backend saves to PostgreSQL, broadcasts via WebSocket
4. Artwork displays update in real-time via WebSocket connection
5. Rating includes: rating value (1-3), institution_id, timestamp

## Project Specifications

Key requirements from `spec.md`:

- Ratings are 1-3 scale (integer)
- Institution IDs identify location (plan to hash for privacy)
- Timestamps in ISO 8601 format, Copenhagen timezone
- Artwork evolves based on incoming data
- Admin panel will support filtering by time/institution and CSV/JSON export
- Future: HTTPS via Caddy for production deployment

## Notes

- The project uses Turborepo for build orchestration and caching
- Database tables are auto-created on API startup (via SQLAlchemy `Base.metadata.create_all`)
- For complete database reset: `docker compose down -v && docker compose up -d && cd packages/api && python seed_db.py`
- Multiple frontend apps support different use cases: user ratings vs. artwork display