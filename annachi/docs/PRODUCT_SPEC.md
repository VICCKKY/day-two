# Annachi (அண்ணாச்சி) – Full Product Spec v1

23 Nov 2026 · Vignesh / dZinerz

> Repo copy. The pilot supplier's name is replaced with "pilot supplier" because this repository is public.

Annachi ஒரு **supplier-only B2B lead app**: manufacturers / suppliers மாசம் ₹3,000 subscription கட்டி, ₹100-க்கு ஒரு verified distributor/wholesaler/bulk-buyer contact வாங்கலாம்.

- **Final-ஆனது:** பெயர், target user, pricing (3 அடுக்கு), 11 screens, design system, logo, trust rules.
- **இன்னும் open:** lead exclusive-ஆ shared-ஆ, pack validity, refund rules, lead supply plan, tech stack, pilot supplier details. கடைசி section பாருங்க.
- Screen-by-screen Stitch prompts தனி doc-ல இருக்கு: *Annachi – App UI Spec for Google Stitch*. இந்த doc "என்ன, ஏன்"; அந்த doc "எப்படி தெரியணும்".

## 1. Problem

சரக்கு ரெடி, ஆனா வாங்க distributor இல்லை. சின்ன / நடுத்தர Tamil Nadu manufacturers-க்கு bulk buyers (distributors, wholesalers, shops) கண்டுபிடிக்கறது தான் பெரிய தடை.

- இப்போ இருக்கற platforms (IndiaMART மாதிரி) ஒரே lead-ஐ பல suppliers-க்கு share பண்றாங்க; quality-ஐ supplier தானே filter பண்ணணும்.
- Field-ல போயி distributors தேடறது நேரமும் செலவும் அதிகம்.
- Lead வாங்கின பிறகு call, follow-up, deal track பண்ண ஒரு இடம் இல்ல.

**Annachi-ஓட பதில்:** நம்ம team phone-ல பேசி verify பண்ணின, consent கொடுத்த bulk buyers-ஐ Swiggy மாதிரி card list-ஆ காட்டி, தேவையான contact-க்கு மட்டும் pay பண்ண வைக்கறது, call முதல் order வரை track பண்ண வைக்கறது.

**Evidence status:** இது இன்னும் hypothesis. இப்போதைக்கு ஒரே ஒரு interested supplier (pilot supplier) மட்டும்; Mannoli-க்கும் distributors தேவை இருக்கு. Supplier interviews இன்னும் பண்ணல.

## 2. யாருக்கு

v1-ல app user ஒரே type: **Supplier**. Buyers app-ல login பண்ண மாட்டாங்க; அவங்க details-ஐ நம்ம team admin side-ல upload பண்ணும். End consumers (retail customers) வேணாம்; bulk orders மட்டும்.

| யாரு | Role | அவங்களுக்கு வேண்டியது |
|---|---|---|
| Supplier (manufacturer / brand owner) | Pay பண்ணும் user | தன் product, தன் ஊருக்கு பொருந்தற உண்மையான bulk buyers |
| Buyer (distributor, wholesaler, shop, bulk buyer) | Lead-ஆ list ஆகறவர் | நல்ல supplier; consent கொடுத்தா மட்டும் contact பண்ணணும் |
| Annachi team (admin) | Lead verify + upload, support | Buyer-ஐ call பண்ணி confirm, consent record |

**முதல் customer:** pilot supplier. அவரோட product, cities, MOQ, இப்போ எங்க இருந்து leads வருது — இந்த details இன்னும் இல்ல.

**Idea எப்படி மாறிச்சு:** முதல்ல South-Indian Alibaba மாதிரி இரு பக்கமும் connect ஆகும் marketplace + chat + quantity negotiation-னு பேசினோம். v1-க்கு அதை supplier-only lead app-ஆ சுருக்கினோம்; marketplace பகுதிகள் later list-ல இருக்கு.

## 3. எப்படி வேலை செய்யும்

Buyer-ஐ நம்ம team verify பண்ணி consent வாங்கின பிறகு தான் supplier-க்கு lead card-ஆ தெரியும்; contact பார்க்க 1 credit (₹100).

Supplier unlock-க்கு முன்னாடியே quantity, ஊர், buyer type, budget, needed-by வச்சு "இந்த lead worth-ஆ"னு decide பண்றார்; தப்பான lead-க்கு credit திரும்ப வரும்.

## 4. Features

v1 = lead வாங்குறது, call பண்றது, track பண்றது, support கேக்குறது — இந்த நாலு மட்டும்.

| Feature | என்ன | Version |
|---|---|---|
| OTP login + business profile | Category, cities, MOQ வச்சு lead feed filter | v1 |
| Membership ₹3,000/month | App access; leads தனியா | v1 |
| Lead feed (Swiggy-style cards) | Product, qty, city, buyer type, budget, needed-by, Verified badge; contact hidden | v1 |
| Lead detail + unlock | 1 credit = 1 contact; confirm sheet; unlock ஆனதும் Call + WhatsApp | v1 |
| Wallet / lead packs | 10 / 50 / 100 credits, UPI pay, GST invoice, history | v1 |
| My Leads tracker | New → Called → Interested → Quote sent → Won / Lost; follow-up date, notes, Won-ல order value | v1 |
| Managed service page | ₹25,000/month; callback request மட்டும், app-ல direct pay இல்ல | v1 |
| AI support chat 24x7 | AI-னு சொல்லிடும்; refund/payment issues human-க்கு handoff | v1 |
| Report a bad lead | Wrong number / not a business / duplicate → approve ஆனா credit back | v1 |
| Bilingual UI | தமிழ் மேல, English கீழ; language toggle | v1 |
| Admin panel (team side) | Buyer upload, verify, consent date, refund tickets | v1 (உள் உபயோகம்) |
| Buyer app, in-app chat, quantity negotiation | Alibaba-style marketplace | Later |
| Product catalogue, cart / checkout, ratings & reviews | Marketplace commerce | Later |
| Multi-user teams, ads, referral program | Growth features | Later |
| Trade commission on Won deals | Order value மேல % | Later (open decision) |
| Claude skills வச்சு lead generation | Lead sourcing-க்கு AI skills | Later; consent rule-க்கு உட்பட்டு மட்டும் |

Later features எல்லாம் pilot supplier முதல் 30 நாள் use பண்ண பிறகு தான் decide.

## 5. Screens (11)

Flow: Onboarding → Login → Profile → Membership → Lead feed (home). Bottom nav-ல 4 tabs: Leads, My Leads, Support, Account.

| # | Screen | Purpose |
|---|---|---|
| S1 | Onboarding (3 slides) | 10 வினாடிக்குள்ள app என்னன்னு புரியணும் |
| S2 | Phone + OTP login | +91 number, 6-digit OTP, Terms/Privacy link |
| S3 | Business profile | Business name, owner, GSTIN (optional), categories, cities, MOQ |
| S4 | Membership ₹3,000 | வாங்குறது app access; leads தனியா-னு clear-ஆ சொல்லணும் |
| S5 | Lead feed (home) | Search, filter chips, lead cards, wallet pill |
| S6 | Lead detail | Full info, masked contact, "Unlock · 1 credit" |
| S7 | Wallet / lead packs | Balance, 3 packs, UPI, invoices |
| S8 | My Leads | Status pipeline, follow-ups, Won order value |
| S9 | Managed service | ₹25,000 offer, guarantee, "qualified" definition, callback |
| S10 | AI support chat | Quick replies, human handoff |
| S11 | Account | Membership, invoices, profile, language, report lead, policies |

App-ஓட heart S5 + S6. இந்த ரெண்டு screen-ல supplier "இந்த lead ₹100-க்கு worth-ஆ"னு decide பண்றார்.

**Design system:** primary teal `#0F5E5A`, accent turmeric `#F2B705`, background `#FAF8F3`; Inter + Noto Sans Tamil; 16px card radius; CRED polish + Swiggy card clarity, South Indian warmth; cartoons, stock photos, அதிக animation வேணாம்.

## 6. MVP

MVP = ஒரு supplier (pilot supplier), 30 நாள், அவருக்கு வேணும்கிற verified leads-ஐ நாம கையால கொண்டு வந்து app வழியா கொடுக்கிறது. **App-ஐ விட lead supply தான் உண்மையான test.**

MVP-ல கட்டாயம்: S2 login, S3 profile, S5 lead feed, S6 unlock, S7 wallet (UPI), S8 My Leads, report-a-bad-lead, admin upload. Onboarding, AI chat, managed-service page முதல் வாரம் எளிமையா இருக்கலாம் (AI chat-க்கு பதிலா WhatsApp support கூட போதும்).

**Success metric (decided):** மாசம் unlock பண்ண leads → அதுல எத்தனை call connect ஆச்சு → எத்தனை order/deal. My Leads tracker இந்த funnel-ஐ அளக்கும்.

**30-day checkpoints (proposal, இன்னும் decide பண்ணல):**

| Metric | Continue | Rethink |
|---|---|---|
| Verified leads நாம supply பண்ண முடிஞ்சது | Pilot supplier வாங்கின pack அளவுக்கு | Pack-ஐ விட குறைவு |
| Unlock பண்ணதுல call connect | 60%+ | 40%-க்கு கீழ |
| Pilot supplier 2வது மாசம் pay பண்றாரா | ஆமா, சொந்த பணத்துல | Discount / free கேட்டா மட்டும் |
| Bad-lead reports | 10%-க்கு கீழ | 25%+ |

Pilot supplier-க்கு மேல 2–3 suppliers pay பண்ணாம app-ஐ பெரிசா build பண்ண வேண்டாம்.

## 7. Pricing

Final pricing: ₹3,000/month membership + ₹100 per lead packs + ₹25,000 managed service.

| Tier | Price | என்ன கிடைக்கும் |
|---|---|---|
| Membership (mandatory) | ₹3,000 / month | App access, lead feed, My Leads, AI support |
| Lead pack – Starter | ₹1,000 | 10 lead contacts |
| Lead pack – Growth | ₹5,000 | 50 lead contacts |
| Lead pack – Pro | ₹10,000 | 100 lead contacts |
| Managed service | ₹25,000 / month | நாமளே தேடி, பேசி, filter பண்ணி தருவோம்: minimum 25 qualified contacts guarantee, target 50 |

**Managed service rules:** 25-க்கு குறைஞ்சா மீதியை அடுத்த மாசம் free அல்லது pro-rata refund. "Qualified contact" = 4ம் இருக்கணும்: (1) நாம phone-ல பேசி confirm, (2) உண்மையான distributor / wholesaler / shop, (3) product, quantity, ஊர் match, (4) contact பண்ண consent. Guarantee இந்த tier-ல மட்டும்; "orders guarantee" எங்கும் இல்ல.

**இந்த முடிவுக்கு வந்த வழி:**
1. ₹999 per lead unlock (first idea). Research-ல IndiaMART paid plans-ல ஒரு lead சுமார் ₹20–50-னு தெரிஞ்சது (தோராய கணக்கு). ₹999 exclusive + verified + பெரிய bulk lead-க்கு மட்டும் நியாயம்.
2. View-only subscriptions ₹2,999 / ₹4,999 / ₹5,999 + ₹999 unlock.
3. Final: ₹3,000 membership + ₹100/lead packs + ₹25,000 managed. Managed service-க்கு "50 distributors guarantee" பதிலா honest "min 25 qualified, target 50".

**Unit check:** 10 members = ₹30,000/month fixed income. ஆனா ஒரு verified lead கொண்டுவர நமக்கு எவ்வளவு செலவாகுது (call time, sourcing)-னு இன்னும் கணக்கு போடல; ₹100-க்கு கீழ இருக்கணும்.

## 8. Tech

Decided: Android app (APK / Play Store), website இல்ல. UI design Google Stitch-ல. Tech stack இன்னும் decide பண்ணல.

| Part | Suggestion | ஏன் |
|---|---|---|
| App | Flutter (Android first) — vendor build | ஒரே code, பிறகு iOS |
| Cheapest test option | PWA (web app) → PWABuilder-ல APK | Pilot MVP-க்கு போதும்; செலவு குறைவு |
| Backend + DB + OTP login | Firebase or Supabase | Server maintain பண்ண வேண்டாம் |
| Payments | Razorpay (UPI, subscriptions, GST invoice) | Recurring ₹3,000 + one-time packs |
| Admin panel | Simple web admin (or Google Sheet → backend sync) | Buyer upload, verify, consent date |
| AI support | Claude API, FAQ / pricing / refund policy மட்டும் knowledge | |
| Call / WhatsApp | Phone dialer + WhatsApp deep link (wa.me) | Extra cost இல்ல |
| Play Store | Google Play developer account (~$25 ஒரு தடவை) | |

**Build முன்னாடி check:** in-app-ல credits / subscription விக்கும்போது Google Play billing policy பொருந்துமா-னு developer verify பண்ணணும்.

**Lead sourcing மேல Claude skills:** buyer-கிட்ட நேரடி consent வாங்கின leads மட்டும். Scraping இல்ல.

## 9. Trust, consent, legal

- **Buyer consent first (DPDP Act):** consent record பண்ணின பிறகு தான் list. Consent date + source admin-ல save. Scrape பண்ணின அல்லது வாங்கின lists கூடாது.
- **Verified badge = real check:** phone-ல business confirm ஆன lead-க்கு மட்டும், verified date-ஓட.
- **No fake social proof:** fake counts, fake ratings, "3 people viewing" எதுவும் இல்ல.
- **Honest guarantee:** Managed service-ல மட்டும் (min 25 qualified).
- **Bad-lead protection:** Report button; approve ஆனா credit back.
- **Clear payments:** Pay button-க்கு முன்னாடி என்ன கிடைக்கும்னு தெரியணும்; ஒவ்வொரு payment-க்கும் GST invoice.
- **AI bot honest:** first message-லயே "AI assistant"; refund, discount, lead promise எதுவும் bot decide பண்ணாது.
- **Brand:** Alibaba பெயர் / logo / design copy இல்ல. "Annachi" trademark, Play Store, domain check pending.
- **Policies:** Terms, Privacy Policy, Refund policy pages வேணும்.

## 10. Brand assets

Logo (மஞ்சள் கடை awning + teal கடை + வெள்ளை "அ"), tagline "தமிழர்களுக்காக, தமிழர்களே உருவாக்கியது", 5s logo animation, 34.5s promo ad, Veo prompts. App live ஆகும் வரை "Download now" போடக்கூடாது.

## 11. Risks, open decisions, next steps

**பெரிய risk app இல்ல, lead supply.** தினமும் consent-ஓட verified bulk buyers-ஐ கொண்டு வரமுடியலைனா suppliers renew பண்ண மாட்டாங்க. இது Mannoli, dZinerz-ல இருந்து நேரம் எடுக்கும் தனி business.

**Open decisions:**
- [ ] Lead exclusive-ஆ இல்ல shared-ஆ (max எத்தனை பேர்)? Pilot மட்டும்னா இப்போ exclusive.
- [ ] Lead pack validity; unused credits என்ன ஆகும்?
- [ ] Refund policy: எந்த reason-க்கு credit back, எத்தனை நாளுக்குள்ள report?
- [ ] Lead supply plan: மாசம் எத்தனை verified buyers, எங்க இருந்து, யார் call பண்ணுவாங்க?
- [ ] Pilot supplier details: product, cities, MOQ, இப்போ lead source.
- [ ] Trade commission on Won deals.
- [ ] Tech stack + build-க்கு யார், budget.
- [ ] Name check: trademark, Play Store, domain.
- [ ] Lawyer review for Terms / Privacy / Refund.

**Next steps:**
1. Pilot supplier-ஓட 30 நிமிஷ call: product, cities, MOQ, இப்போ lead-க்கு எவ்வளவு செலவழிக்கிறார்.
2. App build பண்றதுக்கு முன்னாடி, கையால 10 verified leads கொண்டு வந்து ₹1,000-க்கு WhatsApp-ல விக்கலாம். இது தான் மலிவான validation.
3. Stitch-ல S5 + S6 design.
4. Step 2 வேலை செய்தா மட்டும் developer quotes வாங்குங்க.
