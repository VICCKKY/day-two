import { ApiError } from "./errors";
import { mockApi } from "./mockApi";
import type {
  CatalogSettings, Funnel, LeadCard, LeadDetail, Me, MyLead, Product, ProductInput, ProfileInput, PublicCatalog,
  PublicProduct, QuoteInput, ReportReason, Wallet,
} from "./types";

export { ApiError } from "./errors";

const TOKEN_KEY = "annachi_token";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable: session-only login */
  }
}


async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`/api${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data: { detail?: unknown } = await res.json();
      if (typeof data.detail === "string") detail = data.detail;
      else if (Array.isArray(data.detail) && data.detail.length) {
        const first: { msg?: unknown } = data.detail[0];
        if (typeof first.msg === "string") detail = first.msg.replace(/^Value error, /, "");
      }
    } catch {
      /* non-JSON error */
    }
    throw new ApiError(res.status, detail);
  }
  return (await res.json()) as T;
}

const httpApi = {
  requestOtp: (phone: string) => req<{ sent: boolean; demo_otp: string | null }>("POST", "/auth/otp/request", { phone }),
  verifyOtp: (phone: string, otp: string) =>
    req<{ access_token: string; is_new: boolean }>("POST", "/auth/otp/verify", { phone, otp }),
  me: () => req<Me>("GET", "/me"),
  saveProfile: (p: ProfileInput) => req<Me>("PUT", "/me", p),
  leads: (params: { q?: string; category?: string; city?: string; mine_only?: boolean }) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.category) qs.set("category", params.category);
    if (params.city) qs.set("city", params.city);
    if (params.mine_only) qs.set("mine_only", "true");
    return req<LeadCard[]>("GET", `/leads?${qs.toString()}`);
  },
  lead: (id: number) => req<LeadDetail>("GET", `/leads/${id}`),
  unlock: (id: number) => req<LeadDetail>("POST", `/leads/${id}/unlock`),
  wallet: () => req<Wallet>("GET", "/wallet"),
  buyMembership: () => req<Wallet>("POST", "/wallet/membership"),
  buyPack: (code: string) => req<Wallet>("POST", `/wallet/packs/${code}`),
  myLeads: () => req<MyLead[]>("GET", "/my-leads"),
  funnel: () => req<Funnel>("GET", "/my-leads/funnel"),
  updateMyLead: (id: number, patch: Partial<Pick<MyLead, "status" | "follow_up_date" | "notes" | "order_value_inr">>) =>
    req<MyLead>("PATCH", `/my-leads/${id}`, patch),
  report: (id: number, reason: ReportReason, details: string) =>
    req<{ status: string }>("POST", `/my-leads/${id}/report`, { reason, details }),
  myProducts: () => req<Product[]>("GET", "/my-products"),
  createProduct: (p: ProductInput) => req<Product>("POST", "/my-products", p),
  updateProduct: (id: number, p: ProductInput) => req<Product>("PUT", `/my-products/${id}`, p),
  deleteProduct: (id: number) => req<Product>("DELETE", `/my-products/${id}`),
  saveCatalog: (c: CatalogSettings) => req<Me>("PUT", "/me/catalog", c),
  publicCatalog: (slug: string) => req<PublicCatalog>("GET", `/public/catalog/${encodeURIComponent(slug)}`),
  publicProduct: (slug: string, id: number) =>
    req<PublicProduct>("GET", `/public/catalog/${encodeURIComponent(slug)}/products/${id}`),
  sendQuote: (slug: string, q: QuoteInput) => req<{ ok: boolean }>("POST", `/public/catalog/${encodeURIComponent(slug)}/quote`, q),
};

export type Api = typeof httpApi;

/** Static demo build (no server, e.g. shared hosting): same API, data kept in this browser. */
export const STATIC_DEMO = import.meta.env.VITE_STATIC_DEMO === "true";
export const api: Api = STATIC_DEMO ? mockApi : httpApi;
