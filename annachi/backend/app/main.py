import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import admin, auth, leads, me, my_leads, wallet

logging.basicConfig(level=logging.INFO)

# Demo: create tables on start. Add Alembic migrations before the pilot uses real data.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Annachi API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",") if o.strip()],
    allow_methods=["*"],
    allow_headers=["*"],
)

for r in (auth.router, me.router, leads.router, wallet.router, my_leads.router, admin.router):
    app.include_router(r, prefix="/api")


@app.get("/api/health")
def health() -> dict[str, object]:
    return {"ok": True, "demo_mode": settings.demo_mode}
