# Annachi (அண்ணாச்சி)

Supplier-only B2B lead app for small and mid-size Tamil Nadu manufacturers. Suppliers pay a monthly
membership and spend credits to unlock bulk buyers (distributors, wholesalers, shops) that the
Annachi team has phoned, verified and got consent from. They then track each lead from first call to order.

**Status:** working demo built by Vignesh / dZinerz. Sample data, no real payments. The business idea
is still a hypothesis (see `docs/PRODUCT_SPEC.md`, "Evidence status").

## What the demo does
- Phone + OTP login (demo OTP `123456`), business profile
- ₹3,000/month membership and 10 / 50 / 100 lead packs (demo payments, clearly marked)
- Lead feed with verified badges; buyer contact stays masked until unlocked
- Unlock for 1 credit with a confirm sheet, then Call / WhatsApp
- My Leads pipeline (new → called → interested → quote sent → won / lost), follow-ups, notes, order value, funnel
- Report a bad lead; admin approval returns the credit and removes the lead from the feed
- Tamil first, English toggle
- **Module 11 — Supplier catalogue + bulk quote** (`docs/CATALOG_MODULE.md`): suppliers add products with
  bulk price tiers and share a public page (`/c/<slug>`); buyers send a quote request (with consent) that lands
  in the supplier's My Leads as "Catalogue quote · Not verified yet", at no credit cost. Demo catalogue: `/c/mannoli`,
  supplier demo login `9876500000`.

## Trust rules enforced in code
- A lead is listed only with a verification date **and** recorded consent (date + source).
- Exclusive leads by default: once unlocked, a lead disappears for other suppliers (`ANNACHI_MAX_UNLOCKS_PER_LEAD`).
- A supplier is never charged twice for the same lead.
- No fake counts, ratings or urgency text.
- Catalogue quotes are the supplier's own leads: never in the shared feed, free, consent required, honeypot +
  rate limits (5 per phone per supplier per 24 h, 20 per IP per hour), unverified until the supplier calls.
- A catalogue is private until published; public pages never return buyer data.

## Run it
```bash
# Backend (http://localhost:8000, docs at /docs)
cd backend
pip install -r requirements.txt
python -m app.seed            # fictional demo leads
uvicorn app.main:app --port 8000

# Frontend (http://localhost:5173)
cd frontend
npm install
npm run dev
```

Add a lead as admin:
```bash
curl -X POST localhost:8000/api/admin/leads -H "X-Admin-Token: dev-admin-token" \
  -H "Content-Type: application/json" -d '{"product":"Groundnut oil","category":"Edible oil",
  "quantity":"500 L","city":"Madurai","buyer_type":"distributor","buyer_name":"Buyer Name",
  "buyer_phone":"9000000000","verified_at":"2026-11-24T10:00:00","consent_at":"2026-11-24T10:00:00",
  "consent_source":"phone call"}'
```

## Static demo (shared hosting, e.g. Hostinger)
Shared hosting can't run the Python backend, so there is a browser-only build. It uses the same
screens and rules (`frontend/src/mockApi.ts`), and each visitor's demo data stays in their own browser.

```bash
cd frontend
npm run build:static        # output: frontend/dist-static/
```
Upload the contents of `dist-static/` to a folder such as `public_html/annachi/` (or a subdomain's
root). It uses hash URLs (`#/lead/1`), so no rewrite rules are needed.

## Checks
```bash
cd backend && python -m pytest -q
cd frontend && npm run type-check && npm run build
```

## Before real use (not done yet)
- Real SMS OTP, Razorpay payments + GST invoices, and a check of Google Play billing rules
- Alembic migrations and PostgreSQL (`ANNACHI_DATABASE_URL`)
- Admin web screen (today: API only), support WhatsApp number
- Terms, Privacy and Refund pages; name / trademark check

## Files
| Path | What |
|---|---|
| `docs/PRODUCT_SPEC.md` | Full product spec v1 |
| `INITIAL.md` | Build scope and rules |
| `CLAUDE.md` | Project rules for AI-assisted development |
| `backend/` | FastAPI + SQLAlchemy API and tests |
| `frontend/` | React + TypeScript + Vite PWA |

Built with a PRP-style AI workflow (define → plan → build per module) learned in a course.
