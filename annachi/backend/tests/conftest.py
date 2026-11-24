import os

os.environ["ANNACHI_DATABASE_URL"] = "sqlite:///./test_annachi.db"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.database import Base, engine  # noqa: E402
from app.main import app  # noqa: E402

ADMIN = {"X-Admin-Token": "dev-admin-token"}


@pytest.fixture(autouse=True)
def fresh_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def login(client: TestClient, phone: str = "9876500001") -> dict[str, str]:
    client.post("/api/auth/otp/request", json={"phone": phone})
    token = client.post("/api/auth/otp/verify", json={"phone": phone, "otp": "123456"}).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def add_lead(client: TestClient, **over) -> int:
    body = {
        "product": "Groundnut oil", "category": "Edible oil", "quantity": "500 L", "city": "Madurai",
        "buyer_type": "distributor", "buyer_name": "Test Buyer Traders", "buyer_phone": "9000000099",
        "verified_at": "2026-11-20T10:00:00", "consent_at": "2026-11-20T10:00:00",
        "consent_source": "phone call",
    } | over
    r = client.post("/api/admin/leads", json=body, headers=ADMIN)
    assert r.status_code == 201, r.text
    return r.json()["id"]


def member_with_credits(client: TestClient, phone: str = "9876500001") -> dict[str, str]:
    h = login(client, phone)
    client.post("/api/wallet/membership", headers=h)
    client.post("/api/wallet/packs/starter", headers=h)
    return h
