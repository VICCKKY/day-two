# Annachi (அண்ணாச்சி) — project rules

Rules Claude follows when working on Annachi.

## Stack
- Backend: FastAPI (Python 3.11+), PostgreSQL via SQLAlchemy, Alembic migrations
- Frontend: React + TypeScript + Vite
- Auth: JWT

## Layout
```
annachi/
├── backend/app/   # main.py, models/, schemas/, routers/, services/
├── backend/tests/
├── frontend/src/  # pages/, components/, services/, types/
├── CLAUDE.md      # this file (project memory)
└── INITIAL.md     # product definition
```

## Standards
- Python: type hints, `logging` not `print`, secrets only from env vars
- TypeScript: typed interfaces, no `any`
- Every module ships with tests

## Workflow
1. Fill `INITIAL.md` (problem, user, modules, MVP)
2. Plan from it, then build module by module
3. Run tests before each commit
