# Module 11 — Supplier Catalogue + Bulk Quote (build input)

Build this module the same way as the others: read `CLAUDE.md` and `INITIAL.md` first, then build
backend → tests → frontend → static demo (`mockApi.ts`). Every rule below must be enforced in code.

## Why

Suppliers (first one: Mannoli) need bulk orders, not just leads. Buyers want to see products and bulk
prices before they talk. This module adds the "Amazon" half in its smallest form: a public catalogue
page per supplier + a "Request bulk quote" button that lands in My Leads.

No cart, no online payment, no delivery tracking in this module. Orders are closed on phone/WhatsApp
and recorded in My Leads (won + order value), as today.

## Users

- **Supplier (logged in):** adds products, sets bulk price tiers, shares the catalogue link.
- **Buyer (not logged in):** opens the link, browses, sends a bulk quote request. Buyers still never log in.

## Data model (new + changed)

### suppliers — add

| Field | Type | Notes |
|---|---|---|
| slug | str, unique | URL name, e.g. `mannoli`. Lowercase letters, digits, hyphen. Set from profile. |
| catalog_public | bool | Default false. Page is visible only when true. |
| whatsapp_phone | str | 10-digit; used for the buyer's "WhatsApp us" button. Defaults to phone. |

### products — new

| Field | Type | Notes |
|---|---|---|
| id | int | |
| supplier_id | FK suppliers | |
| name, name_ta | str | English + Tamil name |
| category | str | Same category list as leads |
| material | str | e.g. "Cow dung", "Brass" |
| size | str | e.g. "8 x 6 in" |
| description | text | Plain text |
| photo_urls | JSON list[str] | Max 5. Demo: URLs. Production: upload to storage (open decision). |
| price_from_inr | int, nullable | Single-piece price shown as "from ₹X" |
| bulk_tiers | JSON list[{min_qty, price_per_piece_inr}] | Sorted by min_qty; ascending qty must have non-increasing price |
| moq | int | Minimum bulk order quantity |
| lead_time_days | int, nullable | Days to make + dispatch a bulk order |
| is_active | bool | Hidden from catalogue when false |
| created_at, updated_at | datetime | |

### leads — add

| Field | Type | Notes |
|---|---|---|
| source | str | `annachi_verified` (default, existing) or `catalog_quote` |
| owner_supplier_id | FK suppliers, nullable | Set for catalog_quote leads. Owned leads never appear in the shared feed. |
| product_id | FK products, nullable | Which product the quote was for |

## Rules the code must enforce

1. The shared lead feed is unchanged. `listable_leads()` must exclude every lead with `owner_supplier_id` set. Existing rule still holds: feed leads need `verified_at` + `consent_at` + `consent_source`.
2. A catalogue quote is the supplier's own inbound lead: it costs 0 credits and needs no membership to receive. It is created as a Lead (`source=catalog_quote`, `owner_supplier_id=supplier`) plus an Unlock row with `status=new`, so it shows up in My Leads with the existing pipeline, follow-up, notes and order value.
3. Consent is required on the quote form. A checkbox (not pre-ticked): "I agree that {business_name} may call or WhatsApp me about this quote." Without it the request is refused (422). Store `consent_at=now`, `consent_source="catalogue quote form"`.
4. `verified_at` stays empty for catalogue quotes until the supplier marks the lead called. My Leads shows a "Not verified yet — call to confirm" badge on unverified catalogue quotes.
5. Phone format: 10-digit Indian mobile (`^[6-9]\d{9}$`), same as admin leads.
6. Spam guard: hidden honeypot field; max 5 quote requests per phone per supplier per 24 h; max 20 per IP per hour. Over the limit → 429 with a plain message.
7. Public page shows only what the supplier entered. No fake counts, ratings, "X people viewing", stock countdowns or urgency text.
8. Prices are the supplier's. If a product has no bulk tiers, show "Ask for bulk price", never a made-up number.
9. Catalogue is private until published: `GET /public/catalog/{slug}` returns 404 when `catalog_public=false`.
10. No buyer personal data on public endpoints. Public endpoints return products and supplier business info only.

## API (all under /api)

| Method | Path | Auth | What |
|---|---|---|---|
| GET | /my-products | supplier | List own products (incl. inactive) |
| POST | /my-products | supplier | Create product |
| PUT | /my-products/{id} | supplier | Update own product (404 if not own) |
| DELETE | /my-products/{id} | supplier | Soft delete (is_active=false) |
| PUT | /me/catalog | supplier | Set slug, catalog_public, whatsapp_phone (slug unique → 409) |
| GET | /public/catalog/{slug} | none | Supplier name, cities, MOQ, WhatsApp number, active products |
| GET | /public/catalog/{slug}/products/{id} | none | One product |
| POST | /public/catalog/{slug}/quote | none | Body: product_id, buyer_name, buyer_phone, city, buyer_type, quantity (int ≥ 1), needed_by (optional), message (optional, ≤ 500), consent (must be true), website (honeypot, must be empty). Creates Lead + Unlock. Returns `{ok: true}` only. |
| GET | /my-leads | supplier | Changed: each row also returns source, product_id, product_name, is_verified |
| GET | /my-leads/funnel | supplier | Changed: add counts split by source |

When a lead from a catalogue quote moves to `called` (PATCH /my-leads/{id}), set `lead.verified_at=now`.

Bad-lead reports for catalog_quote leads: allowed, but there is no credit to return; approval only removes the lead.

## Frontend

**Supplier screens (logged in)**
- My Catalogue (new tab): product list → Add / Edit form (name EN/TA, category, material, size, description, photo URLs, single price, bulk tiers editor with + row, MOQ, lead time, active toggle).
- Share card on My Catalogue: catalogue link, "Copy link", "Share on WhatsApp" (`https://wa.me/?text=...`), publish toggle with the slug field, preview button that opens the public page.
- My Leads: source chip — "Annachi verified" or "Catalogue quote"; "Not verified yet" badge (rule 4); product name on catalogue-quote rows.

**Public pages (no login, mobile-first, Tamil first + English toggle)**
- `#/c/{slug}` — supplier header (business name, cities served, MOQ), product grid (photo, name, "from ₹X" or "Ask for bulk price", MOQ).
- `#/c/{slug}/p/{id}` — photos, description, size, material, bulk price table, lead time, two buttons: Request bulk quote (form with rule 3 consent checkbox) and WhatsApp us (`https://wa.me/91{whatsapp_phone}?text=` prefilled with the product name).
- After submit: plain confirmation "{business_name} will contact you." No promises about time or price.

## Static demo

Same endpoints in `frontend/src/mockApi.ts` with 4 sample Mannoli-style products using clearly fictional demo prices and a "Demo data" banner on the public page in demo mode.

## Tests (backend, required)

1. Create / update / soft-delete product; another supplier cannot edit it (404).
2. Bulk tiers validation: unsorted or rising price per piece → 422.
3. Public catalogue 404 when unpublished; 200 with only active products when published.
4. Quote without consent → 422; with honeypot filled → 422.
5. Valid quote creates Lead (source=catalog_quote, owner_supplier_id set, verified_at null) + Unlock (new), and the supplier's credits are unchanged.
6. Catalogue-quote leads never appear in /leads feed for any supplier.
7. PATCH status called sets verified_at.
8. Rate limit returns 429 after the 6th request from the same phone in 24 h.
9. Duplicate slug → 409.
10. Public endpoints never return buyer name or phone.

All existing 9 tests must still pass.

## Out of scope

Cart, online payment, GST invoice, shipping/logistics, buyer accounts, reviews/ratings, marketplace search across suppliers, commission, real photo upload storage, SMS/WhatsApp API notifications.

## Open decisions (config, ask Vignesh)

| Decision | Config | Default |
|---|---|---|
| Can a supplier without membership publish a catalogue? | `CATALOG_REQUIRES_MEMBERSHIP` | false (catalogue is the free hook) |
| Max products per supplier | `MAX_PRODUCTS_PER_SUPPLIER` | 50 |
| Notify supplier of new quote | — | v1: My Leads badge only; WhatsApp notification later |
| Photo storage | — | URLs only in demo |

## Acceptance

- Mannoli can add products with bulk tiers, publish `#/c/mannoli`, and share the link on WhatsApp.
- A buyer on a phone can open the link, see bulk prices, and send a quote request with consent.
- The request appears in Mannoli's My Leads as "Catalogue quote · Not verified yet", costs 0 credits, and moves through new → called → interested → quote_sent → won with order value.
- Shared lead feed behaviour is unchanged. Backend tests pass; frontend type-checks and builds; static demo works.

## Content Mannoli must supply before going live (not code)

Real product photos, names, sizes, single-piece price, bulk tiers (e.g. 25 / 50 / 100 pieces → ₹ per piece), MOQ and lead time. Do not publish with placeholder prices.
