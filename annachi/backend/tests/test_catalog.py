from tests.conftest import ADMIN, add_lead, login, member_with_credits

PRODUCT = {
    "name": "Ganesha wall plaque", "name_ta": "விநாயகர் சுவர் தட்டு", "category": "Home decor",
    "material": "Cow dung", "size": "8 x 6 in", "description": "Hand-made.",
    "photo_urls": ["https://example.com/a.jpg"], "price_from_inr": 450,
    "bulk_tiers": [{"min_qty": 25, "price_per_piece_inr": 380}, {"min_qty": 100, "price_per_piece_inr": 320}],
    "moq": 25, "lead_time_days": 10,
}


def supplier(client, phone="9876500001", slug="mannoli", publish=True):
    h = login(client, phone)
    client.put("/api/me", headers=h, json={
        "business_name": "Mannoli Demo", "owner_name": "Owner", "categories": ["Home decor"],
        "cities": ["Coimbatore"], "moq": "25 pcs",
    })
    r = client.put("/api/me/catalog", headers=h, json={"slug": slug, "catalog_public": publish})
    assert r.status_code == 200, r.text
    return h


def make_product(client, h, **over):
    r = client.post("/api/my-products", headers=h, json=PRODUCT | over)
    assert r.status_code == 201, r.text
    return r.json()["id"]


def quote_body(product_id, **over):
    return {
        "product_id": product_id, "buyer_name": "Demo Buyer", "buyer_phone": "9123456789", "city": "Madurai",
        "buyer_type": "shop", "quantity": 50, "message": "Need for Diwali", "consent": True, "website": "",
    } | over


def test_product_crud_and_ownership(client):
    a = supplier(client)
    b = login(client, "9876500002")
    pid = make_product(client, a)
    r = client.put(f"/api/my-products/{pid}", headers=a, json=PRODUCT | {"name": "Lakshmi idol"})
    assert r.json()["name"] == "Lakshmi idol"
    assert client.put(f"/api/my-products/{pid}", headers=b, json=PRODUCT).status_code == 404
    assert client.delete(f"/api/my-products/{pid}", headers=b).status_code == 404
    assert client.delete(f"/api/my-products/{pid}", headers=a).json()["is_active"] is False
    assert len(client.get("/api/my-products", headers=a).json()) == 1  # inactive still listed for owner


def test_bulk_tier_validation(client):
    h = supplier(client)
    unsorted = [{"min_qty": 100, "price_per_piece_inr": 300}, {"min_qty": 25, "price_per_piece_inr": 380}]
    rising = [{"min_qty": 25, "price_per_piece_inr": 300}, {"min_qty": 100, "price_per_piece_inr": 350}]
    assert client.post("/api/my-products", headers=h, json=PRODUCT | {"bulk_tiers": unsorted}).status_code == 422
    assert client.post("/api/my-products", headers=h, json=PRODUCT | {"bulk_tiers": rising}).status_code == 422


def test_public_catalog_visibility(client):
    h = supplier(client, publish=False)
    active = make_product(client, h)
    hidden = make_product(client, h, name="Old item")
    client.delete(f"/api/my-products/{hidden}", headers=h)
    assert client.get("/api/public/catalog/mannoli").status_code == 404
    client.put("/api/me/catalog", headers=h, json={"slug": "mannoli", "catalog_public": True})
    r = client.get("/api/public/catalog/mannoli")
    assert r.status_code == 200
    assert [p["id"] for p in r.json()["products"]] == [active]
    assert client.get(f"/api/public/catalog/mannoli/products/{hidden}").status_code == 404


def test_quote_requires_consent_and_empty_honeypot(client):
    h = supplier(client)
    pid = make_product(client, h)
    assert client.post("/api/public/catalog/mannoli/quote", json=quote_body(pid, consent=False)).status_code == 422
    assert client.post("/api/public/catalog/mannoli/quote", json=quote_body(pid, website="spam.example")).status_code == 422
    assert client.get("/api/my-leads", headers=h).json() == []


def test_valid_quote_creates_owned_unverified_lead_for_free(client):
    h = supplier(client)
    pid = make_product(client, h)
    credits_before = client.get("/api/me", headers=h).json()["credits"]
    r = client.post("/api/public/catalog/mannoli/quote", json=quote_body(pid))
    assert r.json() == {"ok": True}
    rows = client.get("/api/my-leads", headers=h).json()
    assert len(rows) == 1
    row = rows[0]
    assert row["source"] == "catalog_quote" and row["status"] == "new"
    assert row["is_verified"] is False and row["lead"]["verified_at"] is None
    assert row["product_id"] == pid and row["product_name"] == "Ganesha wall plaque"
    assert row["lead"]["buyer_phone"] == "9123456789"  # owner sees the contact without paying
    assert client.get("/api/me", headers=h).json()["credits"] == credits_before
    assert client.get("/api/my-leads/funnel", headers=h).json()["by_source"] == {"annachi_verified": 0, "catalog_quote": 1}


def test_catalog_quotes_never_in_shared_feed(client):
    h = supplier(client)
    pid = make_product(client, h)
    client.post("/api/public/catalog/mannoli/quote", json=quote_body(pid))
    shared = add_lead(client)
    other = member_with_credits(client, "9876500003")
    for headers in (h, other):
        assert [c["id"] for c in client.get("/api/leads", headers=headers).json()] == [shared]


def test_called_sets_verified_at(client):
    h = supplier(client)
    pid = make_product(client, h)
    client.post("/api/public/catalog/mannoli/quote", json=quote_body(pid))
    unlock_id = client.get("/api/my-leads", headers=h).json()[0]["unlock_id"]
    row = client.patch(f"/api/my-leads/{unlock_id}", headers=h, json={"status": "called"}).json()
    assert row["is_verified"] is True and row["lead"]["verified_at"] is not None


def test_rate_limit_per_phone(client):
    h = supplier(client)
    pid = make_product(client, h)
    for _ in range(5):
        assert client.post("/api/public/catalog/mannoli/quote", json=quote_body(pid)).status_code == 200
    r = client.post("/api/public/catalog/mannoli/quote", json=quote_body(pid))
    assert r.status_code == 429
    # A different buyer phone is still allowed.
    assert client.post("/api/public/catalog/mannoli/quote", json=quote_body(pid, buyer_phone="9123400000")).status_code == 200


def test_duplicate_slug(client):
    supplier(client, "9876500001", "mannoli")
    b = login(client, "9876500002")
    r = client.put("/api/me/catalog", headers=b, json={"slug": "mannoli", "catalog_public": False})
    assert r.status_code == 409
    assert client.put("/api/me/catalog", headers=b, json={"slug": "Bad Slug!", "catalog_public": False}).status_code == 422


def test_public_endpoints_never_leak_buyer_data(client):
    h = supplier(client)
    pid = make_product(client, h)
    client.post("/api/public/catalog/mannoli/quote", json=quote_body(pid, buyer_name="Secret Buyer"))
    for path in ("/api/public/catalog/mannoli", f"/api/public/catalog/mannoli/products/{pid}"):
        text = client.get(path).text
        assert "9123456789" not in text and "Secret Buyer" not in text


def test_bad_report_on_catalog_quote_returns_no_credit(client):
    h = supplier(client)
    pid = make_product(client, h)
    client.post("/api/public/catalog/mannoli/quote", json=quote_body(pid))
    unlock_id = client.get("/api/my-leads", headers=h).json()[0]["unlock_id"]
    rep = client.post(f"/api/my-leads/{unlock_id}/report", headers=h, json={"reason": "wrong_number"}).json()
    client.post(f"/api/admin/reports/{rep['id']}/approve", headers=ADMIN)
    assert client.get("/api/me", headers=h).json()["credits"] == 0
