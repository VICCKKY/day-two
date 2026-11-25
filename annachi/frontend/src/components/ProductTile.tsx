import { useApp } from "../context";
import { inr } from "../i18n";
import type { PublicProduct } from "../types";

export function ProductPhoto({ product, large = false }: { product: Pick<PublicProduct, "name" | "photo_urls">; large?: boolean }) {
  const src = product.photo_urls[0];
  return src ? (
    <img className={large ? "photo photo-lg" : "photo"} src={src} alt={product.name} loading="lazy" />
  ) : (
    <div className={large ? "photo photo-lg placeholder" : "photo placeholder"} aria-hidden>
      {product.name.charAt(0)}
    </div>
  );
}

/**
 * Shows only the supplier's own numbers (rule 8): "from ₹X" is the single-piece price, the bulk line is
 * the best tier they entered, and with no tiers it says "Ask for bulk price" — never a made-up number.
 */
export function PriceLine({ product }: { product: Pick<PublicProduct, "price_from_inr" | "bulk_tiers"> }) {
  const { t, lang } = useApp();
  const best = product.bulk_tiers[product.bulk_tiers.length - 1];
  return (
    <span className="price-line">
      {product.price_from_inr !== null && (
        <span>{lang === "ta" ? <><strong>{inr(product.price_from_inr)}</strong> {t("from")}</> : <>{t("from")} <strong>{inr(product.price_from_inr)}</strong></>}</span>
      )}
      {best ? (
        <span className="bulk-line">Bulk {best.min_qty}+ : {inr(best.price_per_piece_inr)} / pc</span>
      ) : (
        <span className="muted">{t("askBulkPrice")}</span>
      )}
    </span>
  );
}
