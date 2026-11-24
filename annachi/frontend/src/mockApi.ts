/**
 * In-browser stand-in for the FastAPI backend, used by the static demo build
 * (shared hosting can't run Python). It applies the same rules as backend/app:
 * consent-only listing, masked contacts, exclusive unlocks, no double charge.
 * Data lives in this browser only.
 */
import { ApiError } from "./errors";
import type {
  BuyerType, Funnel, LeadCard, LeadDetail, LeadStatus, Me, MyLead, ProfileInput, ReportReason, Txn, Wallet,
} from "./types";

const DB_KEY = "annachi_demo_db_v1";
const TOKEN_KEY = "annachi_token";
const DEMO_OTP = "123456";
const MEMBERSHIP_PRICE = 3000;
const MEMBERSHIP_DAYS = 30;
const MAX_UNLOCKS_PER_LEAD = 1;
const REPORT_WINDOW_DAYS = 7;
const PACKS: Record<string, [number, number]> = { starter: [10, 1000], growth: [50, 5000], pro: [100, 10000] };

interface SupplierRec extends Omit<Me, "membership_active" | "profile_complete"> {}
interface LeadRec {
  id: number; product: string; category: string; quantity: string; city: string; buyer_type: BuyerType;
  budget: string; needed_by: string | null; notes: string; buyer_name: string; buyer_phone: string;
  verified_at: string; consent_at: string; consent_source: string; is_active: boolean;
}
interface UnlockRec {
  id: number; supplier_id: number; lead_id: number; status: LeadStatus; follow_up_date: string | null;
  notes: string; order_value_inr: number | null; created_at: string; updated_at: string;
}
interface ReportRec { id: number; unlock_id: number; reason: ReportReason; details: string; status: string; created_at: string }
interface Db {
  seq: number; suppliers: SupplierRec[]; leads: LeadRec[]; unlocks: UnlockRec[];
  txns: (Txn & { supplier_id: number })[]; reports: ReportRec[];
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
    };
  });
  return { seq: 100, suppliers: [], leads, unlocks: [], txns: [], reports: [] };
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
  ...s, membership_active: active(s), profile_complete: Boolean(s.business_name && s.categories.length && s.cities.length),
});
const listable = (l: LeadRec) => l.is_active && Boolean(l.verified_at && l.consent_at && l.consent_source);
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
  return {
    unlock_id: u.id, lead: detail(db, lead, u), status: u.status, follow_up_date: u.follow_up_date,
    notes: u.notes, order_value_inr: u.order_value_inr,
    report_status: reports.length ? reports[reports.length - 1].status : null, created_at: u.created_at,
  };
}

function txn(db: Db, s: SupplierRec, kind: Txn["kind"], credits_delta: number, amount_inr: number, reference: string) {
  db.txns.push({ id: nextId(db), supplier_id: s.id, kind, credits_delta, amount_inr, reference, created_at: iso(now()) });
}

const demoRef = () => "DEMO-" + Math.random().toString(36).slice(2, 12).toUpperCase();

export const mockApi = {
  requestOtp: async (phone: string) => {
    if (!/^[6-9]\d{9}$/.test(phone)) throw new ApiError(422, "Enter a valid 10-digit mobile number");
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
        language: "ta", membership_until: null, credits: 0,
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
      .sort((a, b) => b.verified_at.localeCompare(a.verified_at))
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
    const f: Funnel = {
      unlocked: rows.length, called: count("called", "interested", "quote_sent", "won", "lost"),
      interested: count("interested", "quote_sent", "won"), quote_sent: count("quote_sent", "won"),
      won: count("won"), lost: count("lost"),
      won_value_inr: rows.filter((u) => u.status === "won").reduce((a, u) => a + (u.order_value_inr ?? 0), 0),
    };
    return delay(f);
  },
  updateMyLead: async (id: number, patch: Partial<Pick<MyLead, "status" | "follow_up_date" | "notes" | "order_value_inr">>) => {
    const db = load();
    const s = current(db);
    const u = db.unlocks.find((x) => x.id === id && x.supplier_id === s.id);
    if (!u) throw new ApiError(404, "Not found");
    Object.assign(u, patch, { updated_at: iso(now()) });
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
};
