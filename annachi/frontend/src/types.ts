export type BuyerType = "distributor" | "wholesaler" | "shop" | "bulk_buyer";
export type LeadStatus = "new" | "called" | "interested" | "quote_sent" | "won" | "lost";
export type ReportReason = "wrong_number" | "not_business" | "duplicate";
export type LeadSource = "annachi_verified" | "catalog_quote";

export interface Me {
  id: number;
  phone: string;
  business_name: string;
  owner_name: string;
  gstin: string;
  categories: string[];
  cities: string[];
  moq: string;
  language: "ta" | "en";
  membership_until: string | null;
  membership_active: boolean;
  credits: number;
  profile_complete: boolean;
  slug: string | null;
  catalog_public: boolean;
  whatsapp_phone: string;
}

export interface LeadCard {
  id: number;
  product: string;
  category: string;
  quantity: string;
  city: string;
  buyer_type: BuyerType;
  budget: string;
  needed_by: string | null;
  verified_at: string | null;
  unlocked: boolean;
  available: boolean;
}

export interface LeadDetail extends LeadCard {
  notes: string;
  buyer_name: string;
  buyer_phone: string;
  unlock_id: number | null;
}

export interface Pack {
  code: string;
  credits: number;
  price_inr: number;
}

export interface Txn {
  id: number;
  kind: "membership" | "pack" | "unlock" | "refund";
  credits_delta: number;
  amount_inr: number;
  reference: string;
  created_at: string;
}

export interface Wallet {
  credits: number;
  membership_until: string | null;
  membership_active: boolean;
  membership_price_inr: number;
  packs: Pack[];
  history: Txn[];
  demo_payments: boolean;
}

export interface MyLead {
  unlock_id: number;
  lead: LeadDetail;
  status: LeadStatus;
  follow_up_date: string | null;
  notes: string;
  order_value_inr: number | null;
  report_status: string | null;
  created_at: string;
  source: LeadSource;
  product_id: number | null;
  product_name: string | null;
  is_verified: boolean;
}

export interface Funnel {
  unlocked: number;
  called: number;
  interested: number;
  quote_sent: number;
  won: number;
  lost: number;
  won_value_inr: number;
  by_source: Record<string, number>;
}

export interface ProfileInput {
  business_name: string;
  owner_name: string;
  gstin: string;
  categories: string[];
  cities: string[];
  moq: string;
  language: "ta" | "en";
}

// ---------- Module 11: catalogue + bulk quote ----------

export interface BulkTier {
  min_qty: number;
  price_per_piece_inr: number;
}

export interface ProductInput {
  name: string;
  name_ta: string;
  category: string;
  material: string;
  size: string;
  description: string;
  photo_urls: string[];
  price_from_inr: number | null;
  bulk_tiers: BulkTier[];
  moq: number;
  lead_time_days: number | null;
  is_active: boolean;
}

export interface Product extends ProductInput {
  id: number;
  created_at: string;
  updated_at: string;
}

export type PublicProduct = Omit<Product, "is_active" | "created_at" | "updated_at">;

export interface PublicCatalog {
  slug: string;
  business_name: string;
  cities: string[];
  moq: string;
  whatsapp_phone: string;
  products: PublicProduct[];
}

export interface CatalogSettings {
  slug: string;
  catalog_public: boolean;
  whatsapp_phone: string;
}

export interface QuoteInput {
  product_id: number;
  buyer_name: string;
  buyer_phone: string;
  city: string;
  buyer_type: BuyerType;
  quantity: number;
  needed_by: string | null;
  message: string;
  consent: boolean;
  website: string;
}
