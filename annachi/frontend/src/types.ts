export type BuyerType = "distributor" | "wholesaler" | "shop" | "bulk_buyer";
export type LeadStatus = "new" | "called" | "interested" | "quote_sent" | "won" | "lost";
export type ReportReason = "wrong_number" | "not_business" | "duplicate";

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
  verified_at: string;
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
}

export interface Funnel {
  unlocked: number;
  called: number;
  interested: number;
  quote_sent: number;
  won: number;
  lost: number;
  won_value_inr: number;
}
