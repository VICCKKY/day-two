# Annachi (அண்ணாச்சி) — Project Handoff

> Paste this whole file into another project (Mannoli, Lead Tracker, a new Claude chat) as context.
> Last updated: 25 Nov 2026 · Owner: Vignesh / dZinerz

---

## 0. Instructions for the AI reading this

- This is the state of **Annachi** as of the date above. Treat sections 4 and 10 as decided; treat section 11 as **open** — ask Vignesh before assuming.
- The business idea is a **hypothesis**. Do not describe it as validated or launched.
- Code lives in GitHub: `VICCKKY/day-two`, branch `claude/crm-mannoli-app-migration-en3ch0`, folder `annachi/`.
- The pilot supplier's name is kept out of the public repo; Vignesh knows who it is.

---

## 1. One-line summary

Supplier-only B2B lead app: small/mid Tamil Nadu manufacturers pay **₹3,000/month** and spend **₹100 credits** to unlock bulk buyers (distributors, wholesalers, shops) that the Annachi team has **phoned, verified and got consent from**, then track each lead from call to order.

## 2. Problem and evidence

- **Problem:** "சரக்கு ரெடி, ஆனா வாங்க distributor இல்லை." Finding bulk buyers is the main block for small manufacturers. IndiaMART-style platforms share one lead with many suppliers; field visits are slow and costly; no place to track follow-ups.
- **Evidence status:** hypothesis. One interested pilot supplier. Mannoli also needs distributors. **No supplier interviews done yet.**

## 3. Users

| User | Role |
|---|---|
| Supplier (manufacturer / brand owner) | Only app user in v1. Pays. |
| Buyer (distributor / wholesaler / shop / bulk buyer) | Listed as a lead. Never logs in. Contacted only with consent. |
| Annachi team (admin) | Phones and verifies buyers, records consent, uploads leads, handles bad-lead reports. |

## 4. Pricing (decided)

| Tier | Price | Gets |
|---|---|---|
| Membership (required) | ₹3,000 / month | App access, lead feed, My Leads, support |
| Starter pack | ₹1,000 | 10 lead contacts |
| Growth pack | ₹5,000 | 50 lead contacts |
| Pro pack | ₹10,000 | 100 lead contacts |
| Managed service | ₹25,000 / month | Min **25 qualified** contacts guaranteed, target 50. No order guarantee. |

"Qualified" = confirmed by phone + real trader + product/quantity/city match + consent to be contacted.

## 5. Trust rules (decided, enforced in code)

1. A lead is listed only with a **verification date AND recorded consent** (date + source). No scraped or bought lists (DPDP Act).
2. Buyer name and phone are **masked until unlocked**.
3. **Exclusive by default:** once one supplier unlocks a lead, others stop seeing it.
4. A supplier is **never charged twice** for the same lead.
5. **Bad-lead report** (wrong number / not a business / duplicate) within 7 days; admin approval returns the credit and removes the lead.
6. **No fake social proof:** no fake counts, ratings or urgency text.
7. Payments show what you get before you pay; the demo says clearly that no money is taken.

## 6. What is built (status: working demo)

| Area | Status |
|---|---|
| Phone + OTP login | ✅ Demo OTP `123456` (no SMS provider yet) |
| Business profile (name, owner, GSTIN, categories, cities, MOQ) | ✅ |
| Membership ₹3,000 | ✅ Demo payment only |
| Wallet + 3 lead packs + history | ✅ Demo payment only |
| Lead feed (cards, Verified badge, search, "matches me", category chips) | ✅ |
| Lead detail + unlock (confirm sheet) + Call / WhatsApp | ✅ |
| My Leads pipeline (new → called → interested → quote_sent → won / lost), follow-up, notes, order value, funnel | ✅ |
| Bad-lead report + admin approve/refund | ✅ (admin via API only) |
| Support page (WhatsApp) + managed-service page | ✅ WhatsApp number not set yet |
| Tamil first, English toggle | ✅ |
| Onboarding slides, AI support chat, admin web screen | ❌ Not built |
| Real SMS OTP, Razorpay, GST invoices, Terms/Privacy/Refund pages | ❌ Not built |
| Public link | ❌ Static zip ready; Vignesh to upload to Hostinger |

Tested: 9 backend tests pass; frontend type-checks and builds; full flow run in a phone-size browser with no errors.

## 7. Tech

| Part | Choice |
|---|---|
| Backend | FastAPI (Python), SQLAlchemy, SQLite in demo (PostgreSQL via `ANNACHI_DATABASE_URL`), JWT |
| Frontend | React + TypeScript + Vite, PWA manifest |
| Static demo | Same frontend with an in-browser API (`frontend/src/mockApi.ts`) for shared hosting; hash URLs |
| Design | Teal `#0F5E5A`, turmeric `#F2B705`, cream `#FAF8F3`, Inter + Noto Sans Tamil, 16px card radius |
| Base workflow | Same as mannoli-crm: `CLAUDE.md` (rules/memory) + `INITIAL.md` (product) → build module by module |

Note: the spec suggested Flutter/Firebase; the demo uses the Mannoli CRM stack as a PWA (the spec's "cheapest test option"; can become an APK via PWABuilder).

## 8. Data model

| Table | Key fields |
|---|---|
| `suppliers` | phone, business_name, owner_name, gstin, categories, cities, moq, language, membership_until, credits |
| `leads` | product, category, quantity, city, buyer_type, budget, needed_by, notes, buyer_name, buyer_phone, **verified_at, consent_at, consent_source**, is_active |
| `unlocks` (= My Leads rows) | supplier_id, lead_id (unique pair), status, follow_up_date, notes, order_value_inr |
| `wallet_txns` | supplier_id, kind (membership / pack / unlock / refund), credits_delta, amount_inr, reference |
| `bad_lead_reports` | unlock_id, reason, details, status (pending / approved / rejected) |

## 9. API (all under `/api`)

| Method | Path | What |
|---|---|---|
| POST | `/auth/otp/request`, `/auth/otp/verify` | Login |
| GET / PUT | `/me` | Profile |
| GET | `/leads?q=&category=&city=&mine_only=` | Feed (masked) |
| GET | `/leads/{id}` | Detail |
| POST | `/leads/{id}/unlock` | Spend 1 credit |
| GET | `/wallet` | Credits, packs, history |
| POST | `/wallet/membership`, `/wallet/packs/{starter\|growth\|pro}` | Demo payments |
| GET | `/my-leads`, `/my-leads/funnel` | Pipeline + funnel |
| PATCH | `/my-leads/{unlock_id}` | Status, follow-up, notes, order value |
| POST | `/my-leads/{unlock_id}/report` | Bad-lead report |
| POST | `/admin/leads` | Add lead (header `X-Admin-Token`; consent required) |
| GET / POST | `/admin/reports`, `/admin/reports/{id}/approve\|reject` | Review reports |

## 10. Brand assets (ready, outside the repo)

Logo (yellow shop awning + teal shop + white "அ"), tagline "தமிழர்களுக்காக, தமிழர்களே உருவாக்கியது", 5s logo animation (9:16, 16:9), 34.5s promo ad, Veo prompts. Fix pending: a colour-code text visible in the promo video. Don't say "Download now" until the app is live.

## 11. Open decisions (ask before assuming)

- [ ] Exclusive vs shared leads (demo default: exclusive, config `ANNACHI_MAX_UNLOCKS_PER_LEAD`)
- [ ] Credit validity; what happens to unused credits
- [ ] Refund rules and report window (demo default: 7 days)
- [ ] Lead supply plan: how many verified buyers a month, from where, who calls
- [ ] Pilot supplier details: product, cities, MOQ, current lead source and spend
- [ ] Commission on won deals
- [ ] Production stack and who builds it; budget
- [ ] Name check: trademark, Play Store, domain
- [ ] Google Play billing vs Razorpay for in-app credits
- [ ] Lawyer review of Terms / Privacy / Refund
- [ ] Support WhatsApp number; hosting domain/subfolder for the demo

## 12. Next steps (in order)

1. Upload the static demo to Hostinger (`designwithvignesh` domain, `/annachi/`) and share the link.
2. 30-minute call with the pilot supplier: product, cities, MOQ, current lead spend.
3. **Cheapest validation:** hand-collect 10 verified, consented leads and sell them for ₹1,000 over WhatsApp — before building more.
4. Only if step 3 works: developer quotes for the production app.

**Biggest risk:** lead supply, not the app. Without a steady flow of verified, consented buyers, suppliers won't renew. This is a separate business that will take time from Mannoli and dZinerz.

## 13. How it connects to other projects

- **Mannoli:** Mannoli needs distributors too. It could be an early Annachi customer, or use the same lead-tracking pipeline (new → called → interested → quote_sent → won / lost) for its own distributor search.
- **Lead Tracker:** the My Leads module (pipeline, follow-up date, notes, order value, funnel) is a reusable lead tracker; its data model and API are in sections 8–9.
- **dZinerz:** portfolio / client showcase of problem → solution → working demo. Present it as a demo of process, not a launched product.

## 14. Files

| Path | What |
|---|---|
| `annachi/docs/PRODUCT_SPEC.md` | Full v1 spec |
| `annachi/docs/HANDOFF.md` | This file |
| `annachi/INITIAL.md` | Build scope and rules |
| `annachi/CLAUDE.md` | Project rules for AI-assisted development |
| `annachi/backend/` | FastAPI API + tests |
| `annachi/frontend/` | React app; `npm run build:static` for Hostinger |
