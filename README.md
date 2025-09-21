# Autonomous AI Knowledge Worker (Starter Monorepo)

This is a **minimal, runnable scaffold** for the Autonomous AI Knowledge Worker.

## Quick Start (Dev)

### Prereqs
- Docker & Docker Compose
- Node 18+ and pnpm (or npm)
- Python 3.11+ (optional for local runs)

### 1) Copy and fill environment
```bash
cp .env.example .env
```

### 2) Start services (API, worker, Redis, Postgres, Frontend)
```bash
docker compose -f docker-compose.dev.yml up --build
```

- API: http://localhost:8000/docs
- Frontend: http://localhost:3000
- Redis: 6379, Postgres: 5432

### 3) Smoke test
- Open API docs → try `/health`
- `POST /ingest/run` with `{ "source": "newsapi", "query": "markets" }` (stubbed)
- Check `/runs/{id}` (stubbed run id returned by trigger)

## Structure
```
/apps
  /backend    # FastAPI + SQLModel + basic routes
  /workers    # Celery worker + simple orchestration graph
  /frontend   # Next.js + Tailwind skeleton
/packages
  /promptkit  # Shared schemas (Pydantic)
/infra
  docker-compose.dev.yml
```

> This is an MVP scaffold: connectors are stubbed; swap SQLite→Postgres by setting `DATABASE_URL`.

## Deploy (example)
- Backend → Render/Heroku (Docker)
- Frontend → Vercel
- DB → Supabase/Render Postgres
- Vector DB → Pinecone/Weaviate (add when ready)
