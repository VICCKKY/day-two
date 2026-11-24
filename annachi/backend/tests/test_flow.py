from tests.conftest import ADMIN, add_lead, login, member_with_credits


def test_wrong_otp_rejected(client):
    r = client.post("/api/auth/otp/verify", json={"phone": "9876500001", "otp": "000000"})
    assert r.status_code == 400


def test_profile_roundtrip(client):
    h = login(client)
    assert client.get("/api/me", headers=h).json()["profile_complete"] is False
    r = client.put("/api/me", headers=h, json={
        "business_name": "Demo Oils", "owner_name": "Vignesh", "categories": ["Edible oil"],
        "cities": ["Madurai", "Salem"], "moq": "100 L",
    })
    assert r.status_code == 200
    assert r.json()["cities"] == ["Madurai", "Salem"] and r.json()["profile_complete"] is True


def test_admin_requires_consent_and_token(client):
    r = client.post("/api/admin/leads", json={"product": "x"})
    assert r.status_code == 403
    r = client.post("/api/admin/leads", headers=ADMIN, json={
        "product": "Oil", "category": "Edible oil", "quantity": "1", "city": "Madurai",
        "buyer_type": "shop", "buyer_name": "AB", "buyer_phone": "9000000001",
        "verified_at": "2026-11-20T10:00:00",  # consent missing
    })
    assert r.status_code == 422


def test_feed_masks_contact(client):
    lead_id = add_lead(client)
    h = login(client)
    feed = client.get("/api/leads", headers=h).json()
    assert [c["id"] for c in feed] == [lead_id]
    d = client.get(f"/api/leads/{lead_id}", headers=h).json()
    assert d["buyer_phone"] == "90XXXXXX99" and "9000000099" not in str(d)


def test_unlock_needs_membership_and_credits(client):
    lead_id = add_lead(client)
    h = login(client)
    assert client.post(f"/api/leads/{lead_id}/unlock", headers=h).status_code == 402
    client.post("/api/wallet/membership", headers=h)
    assert client.post(f"/api/leads/{lead_id}/unlock", headers=h).status_code == 402  # no credits
    assert client.post("/api/wallet/packs/starter", headers=h).json()["credits"] == 10
    d = client.post(f"/api/leads/{lead_id}/unlock", headers=h).json()
    assert d["buyer_phone"] == "9000000099" and d["unlocked"] is True
    # Unlocking again never charges twice.
    client.post(f"/api/leads/{lead_id}/unlock", headers=h)
    assert client.get("/api/wallet", headers=h).json()["credits"] == 9


def test_exclusive_lead_disappears_for_others(client):
    lead_id = add_lead(client)
    a = member_with_credits(client, "9876500001")
    b = member_with_credits(client, "9876500002")
    client.post(f"/api/leads/{lead_id}/unlock", headers=a)
    assert client.get("/api/leads", headers=b).json() == []
    assert client.post(f"/api/leads/{lead_id}/unlock", headers=b).status_code == 409
    assert client.get("/api/wallet", headers=b).json()["credits"] == 10


def test_pipeline_and_funnel(client):
    lead_id = add_lead(client)
    h = member_with_credits(client)
    client.post(f"/api/leads/{lead_id}/unlock", headers=h)
    unlock_id = client.get("/api/my-leads", headers=h).json()[0]["unlock_id"]
    r = client.patch(f"/api/my-leads/{unlock_id}", headers=h, json={"status": "won", "order_value_inr": 120000})
    assert r.json()["status"] == "won"
    f = client.get("/api/my-leads/funnel", headers=h).json()
    assert f == {"unlocked": 1, "called": 1, "interested": 1, "quote_sent": 1, "won": 1, "lost": 0,
                 "won_value_inr": 120000}


def test_bad_lead_refund(client):
    lead_id = add_lead(client)
    h = member_with_credits(client)
    client.post(f"/api/leads/{lead_id}/unlock", headers=h)
    unlock_id = client.get("/api/my-leads", headers=h).json()[0]["unlock_id"]
    rep = client.post(f"/api/my-leads/{unlock_id}/report", headers=h, json={"reason": "wrong_number"}).json()
    assert client.post(f"/api/my-leads/{unlock_id}/report", headers=h, json={"reason": "duplicate"}).status_code == 409
    assert client.post(f"/api/admin/reports/{rep['id']}/approve", headers=ADMIN).json()["status"] == "approved"
    assert client.get("/api/wallet", headers=h).json()["credits"] == 10
    assert client.get("/api/leads", headers=h).json() == []  # bad lead leaves the feed


def test_other_supplier_cannot_touch_my_lead(client):
    lead_id = add_lead(client)
    a = member_with_credits(client, "9876500001")
    b = login(client, "9876500002")
    client.post(f"/api/leads/{lead_id}/unlock", headers=a)
    unlock_id = client.get("/api/my-leads", headers=a).json()[0]["unlock_id"]
    assert client.patch(f"/api/my-leads/{unlock_id}", headers=b, json={"notes": "x"}).status_code == 404
