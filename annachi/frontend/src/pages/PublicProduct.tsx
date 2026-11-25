import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { ProductPhoto } from "../components/ProductTile";
import { useApp } from "../context";
import { consentText, inr, label, quoteSentText } from "../i18n";
import { waLink } from "../links";
import type { BuyerType, PublicProduct as Product } from "../types";
import { PublicFrame, useCatalog } from "./PublicCatalog";

const BUYER_TYPES: BuyerType[] = ["distributor", "wholesaler", "shop", "bulk_buyer"];

function QuoteForm({ slug, product, business }: { slug: string; product: Product; business: string }) {
  const { t, lang } = useApp();
  const [f, setF] = useState({
    buyer_name: "", buyer_phone: "", city: "", buyer_type: "shop" as BuyerType,
    quantity: String(product.moq), needed_by: "", message: "", website: "",
  });
  const [consent, setConsent] = useState(false); // never pre-ticked (rule 3)
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.sendQuote(slug, {
        product_id: product.id, buyer_name: f.buyer_name, buyer_phone: f.buyer_phone, city: f.city,
        buyer_type: f.buyer_type, quantity: Number(f.quantity), needed_by: f.needed_by || null,
        message: f.message, consent, website: f.website,
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="card sent" role="status">
        <h3>{t("quoteSentTitle")}</h3>
        <p>{quoteSentText(lang, business)}</p>
      </div>
    );
  }

  const set = (k: keyof typeof f, v: string) => setF((prev) => ({ ...prev, [k]: v }));

  return (
    <form className="card stack tight" onSubmit={submit} id="quote">
      <h3>{t("quoteTitle")}</h3>
      <label className="field">
        <span>{t("yourName")}</span>
        <input value={f.buyer_name} onChange={(e) => set("buyer_name", e.target.value)} required minLength={2} autoComplete="name" />
      </label>
      <label className="field">
        <span>{t("yourPhone")}</span>
        <div className="phone-input">
          <span>+91</span>
          <input inputMode="numeric" maxLength={10} value={f.buyer_phone} autoComplete="tel-national"
            onChange={(e) => set("buyer_phone", e.target.value.replace(/\D/g, ""))} required />
        </div>
      </label>
      <div className="row">
        <label className="field">
          <span>{t("yourCity")}</span>
          <input value={f.city} onChange={(e) => set("city", e.target.value)} required minLength={2} />
        </label>
        <label className="field">
          <span>{t("qtyNeeded")}</span>
          <input inputMode="numeric" value={f.quantity} onChange={(e) => set("quantity", e.target.value.replace(/\D/g, ""))} required />
        </label>
      </div>
      <label className="field">
        <span>{t("youAre")}</span>
        <select value={f.buyer_type} onChange={(e) => set("buyer_type", e.target.value)}>
          {BUYER_TYPES.map((b) => <option key={b} value={b}>{label.buyer(lang, b)}</option>)}
        </select>
      </label>
      <label className="field">
        <span>{t("neededByOpt")}</span>
        <input type="date" value={f.needed_by} onChange={(e) => set("needed_by", e.target.value)} />
      </label>
      <label className="field">
        <span>{t("message")}</span>
        <textarea rows={2} maxLength={500} value={f.message} onChange={(e) => set("message", e.target.value)} />
      </label>
      {/* Honeypot: hidden from people, bots fill it in. */}
      <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website"
        value={f.website} onChange={(e) => set("website", e.target.value)} />
      <label className="consent">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
        <span>{consentText(lang, business)}</span>
      </label>
      {error && <p className="error">{error}</p>}
      <button className="btn btn-primary" disabled={busy || !consent}>{t("send")}</button>
    </form>
  );
}

export function PublicProduct() {
  const { slug, id } = useParams();
  const { t, lang } = useApp();
  const { cat, missing } = useCatalog(slug);
  const [product, setProduct] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (slug && id) api.publicProduct(slug, Number(id)).then(setProduct).catch(() => setNotFound(true));
  }, [slug, id]);

  if (missing || notFound) return <PublicFrame><p className="empty">{t("catalogueNotFound")}</p></PublicFrame>;
  if (!cat || !product || !slug) return <PublicFrame><div className="loading">…</div></PublicFrame>;

  const title = lang === "ta" && product.name_ta ? product.name_ta : product.name;
  const waText = lang === "ta" ? `வணக்கம், "${product.name}" bulk விலை பற்றி கேட்க விரும்புகிறேன்.` : `Hello, I'd like the bulk price for "${product.name}".`;

  return (
    <PublicFrame>
      <Link className="link-btn back-link" to={`/c/${slug}`}>‹ {cat.business_name} · {t("viewCatalogue")}</Link>
      <ProductPhoto product={product} large />
      {product.photo_urls.length > 1 && (
        <div className="thumbs">
          {product.photo_urls.slice(1).map((u) => <img key={u} src={u} alt="" loading="lazy" />)}
        </div>
      )}
      <h1 className="product-title">{title}</h1>
      {lang === "ta" && product.name_ta && <p className="muted">{product.name}</p>}
      <dl className="facts">
        {product.material && <><dt>{t("material")}</dt><dd>{product.material}</dd></>}
        {product.size && <><dt>{t("size")}</dt><dd>{product.size}</dd></>}
        <dt>MOQ</dt><dd>{product.moq} {t("pcs")}</dd>
        {product.price_from_inr !== null && <><dt>{t("perPiece")}</dt><dd>{inr(product.price_from_inr)}</dd></>}
        {product.lead_time_days !== null && <><dt>{t("leadTime")}</dt><dd>{product.lead_time_days} {t("days")}</dd></>}
      </dl>
      {product.description && <p>{product.description}</p>}

      <div className="card">
        <h3>{t("bulkTable")}</h3>
        {product.bulk_tiers.length ? (
          <table className="tier-table">
            <thead><tr><th>{t("qtyPlus")}</th><th>{t("perPiece")}</th></tr></thead>
            <tbody>
              {product.bulk_tiers.map((tier) => (
                <tr key={tier.min_qty}><td>{tier.min_qty}+ {t("pcs")}</td><td>{inr(tier.price_per_piece_inr)}</td></tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="muted">{t("askBulkPrice")}</p>
        )}
      </div>

      <div className="row">
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>{t("requestQuote")}</button>
        <a className="btn btn-outline" href={waLink(waText, cat.whatsapp_phone)} target="_blank" rel="noreferrer">{t("waUs")}</a>
      </div>
      {showForm && <QuoteForm slug={slug} product={product} business={cat.business_name} />}
    </PublicFrame>
  );
}
