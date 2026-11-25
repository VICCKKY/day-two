# Annachi — product definition (build input)

> Full spec: `docs/PRODUCT_SPEC.md`. This file is the short version the build follows.

## Product
**Annachi (அண்ணாச்சி)** — supplier-only B2B lead app for small/mid Tamil Nadu manufacturers.
Suppliers pay a ₹3,000/month membership and spend credits (₹100 each) to unlock the contact of a
bulk buyer (distributor, wholesaler, shop) that our team has phoned, verified and got consent from.

**Status:** hypothesis. One interested pilot supplier; no supplier interviews yet.
**This build:** a working demo (portfolio + dZinerz client showcase) that can grow into the pilot MVP.

## Users
- **Supplier** — the only app user in v1. Pays.
- **Admin (Annachi team)** — uploads verified, consented buyers; handles bad-lead reports.
- Buyers never log in.

## MVP modules (this build)
1. **Auth** — phone + OTP (demo OTP `123456`; real SMS provider later), JWT.
2. **Business profile** — business name, owner, GSTIN (optional), categories, cities, MOQ.
3. **Membership** — ₹3,000/month; required to unlock. Demo payment only.
4. **Lead feed (S5)** — verified + consented leads only; filter by category, city, search; contact hidden.
5. **Lead detail + unlock (S6)** — 1 credit = 1 contact; then Call + WhatsApp.
6. **Wallet (S7)** — packs 10 / 50 / 100 credits for ₹1,000 / ₹5,000 / ₹10,000; history. Demo payment only.
7. **My Leads (S8)** — new → called → interested → quote_sent → won / lost; follow-up date, notes, order value.
8. **Report a bad lead** — wrong number / not a business / duplicate; admin approve = credit back.
9. **Admin API** — add lead (consent date + source required), review reports.
10. **Bilingual UI** — Tamil first, English toggle.
11. **Supplier catalogue + bulk quote** — full spec in `docs/CATALOG_MODULE.md`.

Later (not in this build): onboarding slides, AI support chat (WhatsApp link instead), managed-service
payments, buyer app, marketplace, commission.

## Rules the code must enforce
- A lead is never shown without `verified_at` **and** `consent_at` + `consent_source`.
- Contact (name, phone) is masked until that supplier unlocks it.
- Unlock needs an active membership and ≥1 credit; the same supplier never pays twice for a lead.
- No fake counts, ratings or urgency text anywhere in the UI.
- Payments in this build are **demo** and say so on screen.

## Open decisions → kept as config
| Decision | Config | Demo default |
|---|---|---|
| Exclusive or shared leads | `MAX_UNLOCKS_PER_LEAD` | 1 (exclusive) |
| Bad-lead report window | `REPORT_WINDOW_DAYS` | 7 |
| Credit validity | not enforced yet | — |

## Acceptance
- Supplier can log in, set profile, take membership, buy a pack, unlock a lead, call/WhatsApp, track it, report it.
- Admin can add a consented lead and approve a report (credit returns).
- Backend tests pass; frontend type-checks and builds.
