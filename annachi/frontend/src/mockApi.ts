/**
 * In-browser stand-in for the FastAPI backend, used by the static demo build
 * (shared hosting can't run Python). It applies the same rules as backend/app:
 * consent-only listing, masked contacts, exclusive unlocks, no double charge,
 * and for the catalogue (Module 11): owned quotes stay out of the shared feed,
 * consent + honeypot + rate limits on quotes, 404 until published.
 * Data lives in this browser only.
 */
import { ApiError } from "./errors";
import type {
  BulkTier, BuyerType, CatalogSettings, Funnel, LeadCard, LeadDetail, LeadSource, LeadStatus, Me, MyLead,
  Product, ProductInput, ProfileInput, PublicCatalog, PublicProduct, QuoteInput, ReportReason, Txn, Wallet,
} from "./types";

const DB_KEY = "annachi_demo_db_v2";
const TOKEN_KEY = "annachi_token";
const DEMO_OTP = "123456";
const MEMBERSHIP_PRICE = 3000;
const MEMBERSHIP_DAYS = 30;
const MAX_UNLOCKS_PER_LEAD = 1;
const REPORT_WINDOW_DAYS = 7;
const MAX_PRODUCTS = 50;
const QUOTES_PER_PHONE_24H = 5;
const QUOTES_PER_BROWSER_1H = 20; // stands in for the per-IP limit
const PACKS: Record<string, [number, number]> = { starter: [10, 1000], growth: [50, 5000], pro: [100, 10000] };
const PHONE_RE = /^[6-9]\d{9}$/;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const DEMO_SUPPLIER_PHONE = "9876500000";

type SupplierRec = Omit<Me, "membership_active" | "profile_complete">;
interface LeadRec {
  id: number; product: string; category: string; quantity: string; city: string; buyer_type: BuyerType;
  budget: string; needed_by: string | null; notes: string; buyer_name: string; buyer_phone: string;
  verified_at: string | null; consent_at: string; consent_source: string; is_active: boolean;
  source: LeadSource; owner_supplier_id: number | null; product_id: number | null;
}
interface UnlockRec {
  id: number; supplier_id: number; lead_id: number; status: LeadStatus; follow_up_date: string | null;
  notes: string; order_value_inr: number | null; created_at: string; updated_at: string;
}
interface ProductRec extends Product { supplier_id: number }
interface ReportRec { id: number; unlock_id: number; reason: ReportReason; details: string; status: string; created_at: string }
interface QuoteRec { supplier_id: number; buyer_phone: string; created_at: string }
interface Db {
  seq: number; suppliers: SupplierRec[]; leads: LeadRec[]; unlocks: UnlockRec[];
  txns: (Txn & { supplier_id: number })[]; reports: ReportRec[]; products: ProductRec[]; quotes: QuoteRec[];
}

const SEED: [string, string, string, string, BuyerType, string, number, string][] = [
  ["Cold-pressed groundnut oil", "Edible oil", "500 litres / month", "Madurai", "distributor", "₹1.2–1.4 lakh / month", 20, "Wants 1L and 5L cans; supplies 40 shops."],
  ["Handloom cotton towels", "Textiles", "2,000 pcs", "Chennai", "wholesaler", "₹60–80 per pc", 30, "Repeat order every quarter if quality holds."],
  ["Masala powder packets (50g)", "Food products", "10,000 packets", "Coimbatore", "distributor", "₹7–9 per packet", 15, "Needs FSSAI licence copy before first order."],
  ["Cow-dung idols & decor", "Home decor", "300 pcs", "Tiruchirappalli", "shop", "₹150–400 per pc", 45, "Pooja store chain, 3 outlets."],
  ["Coir door mats", "Home decor", "1,500 pcs", "Salem", "wholesaler", "₹90–120 per pc", 25, "Prefers printed designs."],
  ["Millet snacks", "Food products", "800 kg", "Erode", "bulk_buyer", "₹1.5 lakh", 10, "Corporate canteen order; sample needed first."],
  ["Stainless steel lunch boxes", "Kitchenware", "1,200 pcs", "Tirunelveli", "distributor", "₹180–220 per pc", 35, "Covers 3 districts."],
  ["Herbal soap bars", "Personal care", "5,000 bars", "Coimbatore", "shop", "₹25–30 per bar", 20, "Supermarket, wants private label later."],
];

// Mannoli-style demo catalogue. Prices are fictional placeholders, not Mannoli's real prices.
const DEMO_PRODUCTS: [string, string, string, number | null, [number, number][], number, number | null, string][] = [
  ["Ganesha wall plaque (demo)", "விநாயகர் சுவர் தட்டு", "8 x 6 in", 450, [[25, 380], [100, 320]], 25, 10, "Hand-pressed relief plaque. Demo listing with fictional prices."],
  ["Lakshmi idol (demo)", "லட்சுமி சிலை", "6 in tall", 350, [[25, 300], [50, 280], [100, 250]], 25, 14, "Free-standing idol for pooja rooms. Demo listing with fictional prices."],
  ["Diya set of 6 (demo)", "அகல் விளக்கு 6", "3 in each", 180, [[50, 140], [200, 120]], 50, 7, "Festival diya set. Demo listing with fictional prices."],
  ["Door hanging toran (demo)", "தோரணம்", "36 in", null, [], 20, null, "Ask for bulk price. Demo listing."],
];

const now = () => new Date();
const iso = (d: Date) => d.toISOString();
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000);

function seed(): Db {
  const t = now();
  const leads: LeadRec[] = SEED.map(([product, category, quantity, city, buyer_type, budget, days, notes], i) => {
    const verified = iso(new Date(t.getTime() - i * 6 * 3_600_000));
    return {
      id: i + 1, product, category, quantity, city, buyer_type, budget,
      needed_by: iso(addDays(t, days)).slice(0, 10), notes,
      buyer_name: `Demo Buyer ${i + 1} Traders`, buyer_phone: `90000000${String(i + 10).padStart(2, "0")}`,
      verified_at: verified, consent_at: verified, consent_source: "Demo data (fictional)", is_active: true,
      source: "annachi_verified", owner_supplier_id: null, product_id: null,
    };
  });
  const mannoli: SupplierRec = {
    id: 50, phone: DEMO_SUPPLIER_PHONE, business_name: "Mannoli (demo)", owner_name: "Demo owner", gstin: "",
    categories: ["Home decor"], cities: ["Coimbatore", "Tiruppur", "Erode"], moq: "20 pcs", language: "ta",
    membership_until: iso(addDays(t, 30)), credits: 0, slug: "mannoli", catalog_public: true,
    whatsapp_phone: DEMO_SUPPLIER_PHONE,
  };
  const products: ProductRec[] = DEMO_PRODUCTS.map(([name, name_ta, size, price, tiers, moq, lead, desc], i) => ({
    id: 60 + i, supplier_id: mannoli.id, name, name_ta, category: "Home decor", material: "Cow dung", size,
    description: desc, photo_urls: [], price_from_inr: price,
    bulk_tiers: tiers.map(([min_qty, price_per_piece_inr]) => ({ min_qty, price_per_piece_inr })),
    moq, lead_time_days: lead, is_active: true, created_at: iso(t), updated_at: iso(t),
  }));
  return { seq: 100, suppliers: [mannoli], leads, unlocks: [], txns: [], reports: [], products, quotes: [] };
}

let memory: Db | null = null;

function load(): Db {
  if (memory) return memory;
  try {
    const raw = localStorage.getItem(DB_KEY);
    memory = raw ? (JSON.parse(raw) as Db) : seed();
  } catch {
    memory = seed();
  }
  return memory;
}

function save(db: Db): void {
  memory = db;
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    /* storage unavailable: demo still works for this tab */
  }
}

/** Demo-only: wipe this browser's demo data. */
export function resetDemo(): void {
  memory = null;
  try {
    localStorage.removeItem(DB_KEY);
  } catch {
    /* ignore */
  }
}

const nextId = (db: Db) => ++db.seq;
const delay = <T>(v: T): Promise<T> => new Promise((r) => setTimeout(() => r(v), 120));

function current(db: Db): SupplierRec {
  let token: string | null = null;
  try {
    token = localStorage.getItem(TOKEN_KEY);
  } catch {
    token = null;
  }
  const s = token?.startsWith("demo:") ? db.suppliers.find((x) => x.phone === token.slice(5)) : undefined;
  if (!s) throw new ApiError(401, "Login required");
  return s;
}

const active = (s: SupplierRec) => Boolean(s.membership_until && new Date(s.membership_until) > now());
const meOut = (s: SupplierRec): Me => ({
  ...s, whatsapp_phone: s.whatsapp_phone || s.phone, membership_active: active(s),
  profile_complete: Boolean(s.business_name && s.categories.length && s.cities.length),
});
/** Shared feed: verified + consented, never a supplier's own catalogue quote. */
const listable = (l: LeadRec) =>
  l.is_active && l.owner_supplier_id === null && Boolean(l.verified_at && l.consent_at && l.consent_source);
const maskPhone = (p: string) => p.slice(0, 2) + "XXXXXX" + p.slice(-2);
const maskName = (n: string) => n.split(" ").map((w) => w[0] + "•".repeat(w.length - 1)).join(" ");

function card(db: Db, l: LeadRec, own: UnlockRec | undefined): LeadCard {
  const taken = db.unlocks.filter((u) => u.lead_id === l.id).length;
  return {
    id: l.id, product: l.product, category: l.category, quantity: l.quantity, city: l.city,
    buyer_type: l.buyer_type, budget: l.budget, needed_by: l.needed_by, verified_at: l.verified_at,
    unlocked: Boolean(own), available: Boolean(own) || taken < MAX_UNLOCKS_PER_LEAD,
  };
}

function detail(db: Db, l: LeadRec, own: UnlockRec | undefined): LeadDetail {
  return {
    ...card(db, l, own), notes: l.notes,
    buyer_name: own ? l.buyer_name : maskName(l.buyer_name),
    buyer_phone: own ? l.buyer_phone : maskPhone(l.buyer_phone),
    unlock_id: own?.id ?? null,
  };
}

function wallet(db: Db, s: SupplierRec): Wallet {
  return {
    credits: s.credits, membership_until: s.membership_until, membership_active: active(s),
    membership_price_inr: MEMBERSHIP_PRICE,
    packs: Object.entries(PACKS).map(([code, [credits, price_inr]]) => ({ code, credits, price_inr })),
    history: db.txns.filter((t) => t.supplier_id === s.id).slice().reverse().slice(0, 50),
    demo_payments: true,
  };
}

function myLead(db: Db, u: UnlockRec): MyLead {
  const lead = db.leads.find((l) => l.id === u.lead_id)!;
  const reports = db.reports.filter((r) => r.unlock_id === u.id);
  const product = lead.product_id ? db.products.find((p) => p.id === lead.product_id) : undefined;
  return {
    unlock_id: u.id, lead: detail(db, lead, u), status: u.status, follow_up_date: u.follow_up_date,
    notes: u.notes, order_value_inr: u.order_value_inr,
    report_status: reports.length ? reports[reports.length - 1].status : null, created_at: u.created_at,
    source: lead.source, product_id: lead.product_id, product_name: product?.name ?? null,
    is_verified: lead.verified_at !== null,
  };
}

function txn(db: Db, s: SupplierRec, kind: Txn["kind"], credits_delta: number, amount_inr: number, reference: string) {
  db.txns.push({ id: nextId(db), supplier_id: s.id, kind, credits_delta, amount_inr, reference, created_at: iso(now()) });
}

const demoRef = () => "DEMO-" + Math.random().toString(36).slice(2, 12).toUpperCase();

function validateProduct(p: ProductInput): void {
  if (p.name.trim().length < 2) throw new ApiError(422, "Product name is required");
  if (p.category.trim().length < 2) throw new ApiError(422, "Category is required");
  if (p.photo_urls.length > 5) throw new ApiError(422, "Up to 5 photos");
  if (p.photo_urls.some((u) => !/^https?:\/\//.test(u))) throw new ApiError(422, "Photo URLs must start with http:// or https://");
  if (p.moq < 1) throw new ApiError(422, "MOQ must be at least 1");
  const t = p.bulk_tiers;
  if (t.some((x) => x.min_qty < 1 || x.price_per_piece_inr < 1)) throw new ApiError(422, "Tier quantity and price must be at least 1");
  for (let i = 1; i < t.length; i++) {
    if (t[i].min_qty <= t[i - 1].min_qty) throw new ApiError(422, "Bulk tiers must be sorted by quantity, smallest first, without repeats");
    if (t[i].price_per_piece_inr > t[i - 1].price_per_piece_inr) throw new ApiError(422, "A bigger quantity cannot have a higher price per piece");
  }
}

const toProduct = ({ supplier_id: _s, ...p }: ProductRec): Product => p;
const toPublic = ({ supplier_id: _s, is_active: _a, created_at: _c, updated_at: _u, ...p }: ProductRec): PublicProduct => p;

function published(db: Db, slug: string): SupplierRec {
  const s = db.suppliers.find((x) => x.slug === slug);
  if (!s || !s.catalog_public) throw new ApiError(404, "Catalogue not found");
  return s;
}

function activeProduct(db: Db, s: SupplierRec, id: number): ProductRec {
  const p = db.products.find((x) => x.id === id && x.supplier_id === s.id && x.is_active);
  if (!p) throw new ApiError(404, "Product not found");
  return p;
}

export const mockApi = {
  requestOtp: async (phone: string) => {
    if (!PHONE_RE.test(phone)) throw new ApiError(422, "Enter a valid 10-digit mobile number");
    return delay({ sent: true, demo_otp: DEMO_OTP as string | null });
  },
  verifyOtp: async (phone: string, otp: string) => {
    if (otp !== DEMO_OTP) throw new ApiError(400, "Wrong OTP");
    const db = load();
    let s = db.suppliers.find((x) => x.phone === phone);
    const is_new = !s;
    if (!s) {
      s = {
        id: nextId(db), phone, business_name: "", owner_name: "", gstin: "", categories: [], cities: [], moq: "",
        language: "ta", membership_until: null, credits: 0, slug: null, catalog_public: false, whatsapp_phone: "",
      };
      db.suppliers.push(s);
      save(db);
    }
    return delay({ access_token: `demo:${phone}`, is_new });
  },
  me: async () => delay(meOut(current(load()))),
  saveProfile: async (p: ProfileInput) => {
    const db = load();
    const s = current(db);
    if (p.gstin && !/^[0-9A-Z]{15}$/.test(p.gstin)) throw new ApiError(422, "GSTIN must be 15 characters");
    Object.assign(s, { ...p, business_name: p.business_name.trim(), owner_name: p.owner_name.trim(), moq: p.moq.trim() });
    save(db);
    return delay(meOut(s));
  },
  leads: async (params: { q?: string; category?: string; city?: string; mine_only?: boolean }) => {
    const db = load();
    const s = current(db);
    const q = (params.q ?? "").toLowerCase();
    const cards = db.leads
      .filter(listable)
      .filter((l) => !q || [l.product, l.category, l.city].some((v) => v.toLowerCase().includes(q)))
      .filter((l) => !params.category || l.category === params.category)
      .filter((l) => !params.city || l.city === params.city)
      .filter((l) => !params.mine_only || ((!s.categories.length || s.categories.includes(l.category)) && (!s.cities.length || s.cities.includes(l.city))))
      .sort((a, b) => (b.verified_at ?? "").localeCompare(a.verified_at ?? ""))
      .map((l) => card(db, l, db.unlocks.find((u) => u.supplier_id === s.id && u.lead_id === l.id)))
      .filter((c) => c.available);
    return delay(cards);
  },
  lead: async (id: number) => {
    const db = load();
    const s = current(db);
    const l = db.leads.find((x) => x.id === id && listable(x));
    const d = l && detail(db, l, db.unlocks.find((u) => u.supplier_id === s.id && u.lead_id === id));
    if (!d || !d.available) throw new ApiError(404, "Lead not found");
    return delay(d);
  },
  unlock: async (id: number) => {
    const db = load();
    const s = current(db);
    const l = db.leads.find((x) => x.id === id && listable(x));
    if (!l) throw new ApiError(404, "Lead not found");
    let own = db.unlocks.find((u) => u.supplier_id === s.id && u.lead_id === id);
    if (own) return delay(detail(db, l, own)); // never charge twice
    if (!active(s)) throw new ApiError(402, "Membership required");
    if (s.credits < 1) throw new ApiError(402, "Not enough credits");
    if (db.unlocks.filter((u) => u.lead_id === id).length >= MAX_UNLOCKS_PER_LEAD) throw new ApiError(409, "Lead no longer available");
    const t = iso(now());
    own = { id: nextId(db), supplier_id: s.id, lead_id: id, status: "new", follow_up_date: null, notes: "", order_value_inr: null, created_at: t, updated_at: t };
    db.unlocks.push(own);
    s.credits -= 1;
    txn(db, s, "unlock", -1, 0, `lead-${id}`);
    save(db);
    return delay(detail(db, l, own));
  },
  wallet: async () => {
    const db = load();
    return delay(wallet(db, current(db)));
  },
  buyMembership: async () => {
    const db = load();
    const s = current(db);
    const start = active(s) ? new Date(s.membership_until!) : now();
    s.membership_until = iso(addDays(start, MEMBERSHIP_DAYS));
    txn(db, s, "membership", 0, MEMBERSHIP_PRICE, demoRef());
    save(db);
    return delay(wallet(db, s));
  },
  buyPack: async (code: string) => {
    const db = load();
    const s = current(db);
    const pack = PACKS[code];
    if (!pack) throw new ApiError(404, "Unknown pack");
    if (!active(s)) throw new ApiError(402, "Membership required");
    s.credits += pack[0];
    txn(db, s, "pack", pack[0], pack[1], demoRef());
    save(db);
    return delay(wallet(db, s));
  },
  myLeads: async () => {
    const db = load();
    const s = current(db);
    const rows = db.unlocks.filter((u) => u.supplier_id === s.id).sort((a, b) => b.updated_at.localeCompare(a.updated_at));
    return delay(rows.map((u) => myLead(db, u)));
  },
  funnel: async () => {
    const db = load();
    const s = current(db);
    const rows = db.unlocks.filter((u) => u.supplier_id === s.id);
    const count = (...st: LeadStatus[]) => rows.filter((u) => st.includes(u.status)).length;
    const by_source: Record<string, number> = { annachi_verified: 0, catalog_quote: 0 };
    for (const u of rows) {
      const src = db.leads.find((l) => l.id === u.lead_id)?.source ?? "annachi_verified";
      by_source[src] = (by_source[src] ?? 0) + 1;
    }
    const f: Funnel = {
      unlocked: rows.length, called: count("called", "interested", "quote_sent", "won", "lost"),
      interested: count("interested", "quote_sent", "won"), quote_sent: count("quote_sent", "won"),
      won: count("won"), lost: count("lost"),
      won_value_inr: rows.filter((u) => u.status === "won").reduce((a, u) => a + (u.order_value_inr ?? 0), 0),
      by_source,
    };
    return delay(f);
  },
  updateMyLead: async (id: number, patch: Partial<Pick<MyLead, "status" | "follow_up_date" | "notes" | "order_value_inr">>) => {
    const db = load();
    const s = current(db);
    const u = db.unlocks.find((x) => x.id === id && x.supplier_id === s.id);
    if (!u) throw new ApiError(404, "Not found");
    Object.assign(u, patch, { updated_at: iso(now()) });
    const lead = db.leads.find((l) => l.id === u.lead_id)!;
    if (patch.status === "called" && lead.source === "catalog_quote" && lead.verified_at === null) {
      lead.verified_at = iso(now()); // rule 4: verified once the supplier has called
    }
    save(db);
    return delay(myLead(db, u));
  },
  report: async (id: number, reason: ReportReason, details: string) => {
    const db = load();
    const s = current(db);
    const u = db.unlocks.find((x) => x.id === id && x.supplier_id === s.id);
    if (!u) throw new ApiError(404, "Not found");
    if (now().getTime() - new Date(u.created_at).getTime() > REPORT_WINDOW_DAYS * 86_400_000) {
      throw new ApiError(400, `Reports allowed within ${REPORT_WINDOW_DAYS} days`);
    }
    if (db.reports.some((r) => r.unlock_id === id && r.status !== "rejected")) throw new ApiError(409, "Already reported");
    const r: ReportRec = { id: nextId(db), unlock_id: id, reason, details, status: "pending", created_at: iso(now()) };
    db.reports.push(r);
    save(db);
    return delay({ status: r.status });
  },

  // ---------- Module 11: catalogue + bulk quote ----------
  myProducts: async () => {
    const db = load();
    const s = current(db);
    return delay(db.products.filter((p) => p.supplier_id === s.id).map(toProduct));
  },
  createProduct: async (input: ProductInput) => {
    const db = load();
    const s = current(db);
    validateProduct(input);
    if (db.products.filter((p) => p.supplier_id === s.id).length >= MAX_PRODUCTS) throw new ApiError(400, `Limit is ${MAX_PRODUCTS} products`);
    const t = iso(now());
    const p: ProductRec = { ...input, bulk_tiers: input.bulk_tiers.map((x: BulkTier) => ({ ...x })), id: nextId(db), supplier_id: s.id, created_at: t, updated_at: t };
    db.products.push(p);
    save(db);
    return delay(toProduct(p));
  },
  updateProduct: async (id: number, input: ProductInput) => {
    const db = load();
    const s = current(db);
    const p = db.products.find((x) => x.id === id && x.supplier_id === s.id);
    if (!p) throw new ApiError(404, "Product not found");
    validateProduct(input);
    Object.assign(p, input, { updated_at: iso(now()) });
    save(db);
    return delay(toProduct(p));
  },
  deleteProduct: async (id: number) => {
    const db = load();
    const s = current(db);
    const p = db.products.find((x) => x.id === id && x.supplier_id === s.id);
    if (!p) throw new ApiError(404, "Product not found");
    p.is_active = false;
    save(db);
    return delay(toProduct(p));
  },
  saveCatalog: async (c: CatalogSettings) => {
    const db = load();
    const s = current(db);
    if (c.slug.length < 3 || c.slug.length > 40 || !SLUG_RE.test(c.slug)) {
      throw new ApiError(422, "Link name: 3–40 lowercase letters, digits or hyphens");
    }
    if (c.whatsapp_phone && !PHONE_RE.test(c.whatsapp_phone)) throw new ApiError(422, "Enter a valid 10-digit WhatsApp number");
    if (db.suppliers.some((x) => x.slug === c.slug && x.id !== s.id)) throw new ApiError(409, "This link name is taken");
    if (c.catalog_public && !s.business_name) throw new ApiError(400, "Complete your business profile first");
    s.slug = c.slug;
    s.catalog_public = c.catalog_public;
    s.whatsapp_phone = c.whatsapp_phone || s.phone;
    save(db);
    return delay(meOut(s));
  },
  publicCatalog: async (slug: string) => {
    const db = load();
    const s = published(db, slug);
    const out: PublicCatalog = {
      slug, business_name: s.business_name, cities: s.cities, moq: s.moq, whatsapp_phone: s.whatsapp_phone || s.phone,
      products: db.products.filter((p) => p.supplier_id === s.id && p.is_active).map(toPublic),
    };
    return delay(out);
  },
  publicProduct: async (slug: string, id: number) => {
    const db = load();
    return delay(toPublic(activeProduct(db, published(db, slug), id)));
  },
  sendQuote: async (slug: string, q: QuoteInput) => {
    const db = load();
    const s = published(db, slug);
    const p = activeProduct(db, s, q.product_id);
    if (q.website) throw new ApiError(422, "Request refused");
    if (q.consent !== true) throw new ApiError(422, "Consent is required to send a quote request");
    if (!PHONE_RE.test(q.buyer_phone)) throw new ApiError(422, "Enter a valid 10-digit mobile number");
    if (q.buyer_name.trim().length < 2 || q.city.trim().length < 2) throw new ApiError(422, "Name and city are required");
    if (!Number.isInteger(q.quantity) || q.quantity < 1) throw new ApiError(422, "Quantity must be at least 1");
    if (q.message.length > 500) throw new ApiError(422, "Message is too long");
    const t = now();
    const perPhone = db.quotes.filter((x) => x.supplier_id === s.id && x.buyer_phone === q.buyer_phone && t.getTime() - new Date(x.created_at).getTime() < 86_400_000).length;
    const perBrowser = db.quotes.filter((x) => t.getTime() - new Date(x.created_at).getTime() < 3_600_000).length;
    if (perPhone >= QUOTES_PER_PHONE_24H || perBrowser >= QUOTES_PER_BROWSER_1H) {
      throw new ApiError(429, "Too many requests. Please try again later or WhatsApp the supplier.");
    }
    const lead: LeadRec = {
      id: nextId(db), product: p.name, category: p.category, quantity: `${q.quantity} pcs`, city: q.city.trim(),
      buyer_type: q.buyer_type, budget: "", needed_by: q.needed_by, notes: q.message.trim(),
      buyer_name: q.buyer_name.trim(), buyer_phone: q.buyer_phone, verified_at: null, consent_at: iso(t),
      consent_source: "catalogue quote form", is_active: true, source: "catalog_quote", owner_supplier_id: s.id, product_id: p.id,
    };
    db.leads.push(lead);
    db.unlocks.push({ id: nextId(db), supplier_id: s.id, lead_id: lead.id, status: "new", follow_up_date: null, notes: "", order_value_inr: null, created_at: iso(t), updated_at: iso(t) });
    db.quotes.push({ supplier_id: s.id, buyer_phone: q.buyer_phone, created_at: iso(t) });
    save(db);
    return delay({ ok: true });
  },
};
