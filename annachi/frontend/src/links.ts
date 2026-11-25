import { STATIC_DEMO } from "./api";

/** Public catalogue URL for sharing. Static demo uses hash URLs (no server rewrites). */
export function catalogUrl(slug: string): string {
  const { origin, pathname } = window.location;
  return STATIC_DEMO ? `${origin}${pathname}#/c/${slug}` : `${origin}/c/${slug}`;
}

export function waLink(text: string, phone?: string): string {
  return `https://wa.me/${phone ? `91${phone}` : ""}?text=${encodeURIComponent(text)}`;
}
