import type { Funnel, LeadCard, LeadDetail, Me, MyLead, ReportReason, Wallet } from "./types";

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

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
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
    } catch {
      /* non-JSON error */
    }
    throw new ApiError(res.status, detail);
  }
  return (await res.json()) as T;
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

export const api = {
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
};
