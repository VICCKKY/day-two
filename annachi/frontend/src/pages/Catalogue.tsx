import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { Header, Screen } from "../components/Layout";
import { PriceLine, ProductPhoto } from "../components/ProductTile";
import { useApp } from "../context";
import { catalogUrl, waLink } from "../links";
import type { Product } from "../types";

function suggestSlug(name: string): string {
  return name.toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}

function ShareCard() {
  const { t, me, refreshMe } = useApp();
  const [slug, setSlug] = useState(me?.slug ?? suggestSlug(me?.business_name ?? ""));
  const [wa, setWa] = useState(me?.whatsapp_phone ?? "");
  const [pub, setPub] = useState(me?.catalog_public ?? false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function save(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMsg("");
    try {
      await api.saveCatalog({ slug, catalog_public: pub, whatsapp_phone: wa });
      await refreshMe();
      setMsg(t("saved"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    }
  }

  const savedSlug = me?.slug;
  const url = savedSlug ? catalogUrl(savedSlug) : "";
  const shareText = `${me?.business_name ?? ""} — bulk price list / மொத்த விலை பட்டியல்: ${url}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setMsg(t("copied"));
    } catch {
      setMsg(url);
    }
  }

  return (
    <form className="card share-card" onSubmit={save}>
      <h3>{t("shareTitle")}</h3>
      <p className="muted small">{t("shareSub")}</p>
      <label className="field">
        <span>{t("linkName")}</span>
        <input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase())} required minLength={3} maxLength={40} />
        <small className="hint">{t("linkNameHint")}</small>
      </label>
      <label className="field">
        <span>{t("waNumber")}</span>
        <input inputMode="numeric" maxLength={10} value={wa} onChange={(e) => setWa(e.target.value.replace(/\D/g, ""))} />
      </label>
      <label className="toggle">
        <input type="checkbox" checked={pub} onChange={(e) => setPub(e.target.checked)} />
        <span>{t("publish")}</span>
      </label>
      {error && <p className="error">{error}</p>}
      {msg && <p className="ok-text">{msg}</p>}
      <button className="btn btn-primary btn-sm">{t("save")}</button>
      {savedSlug && (
        <>
          <code className="link-box">{url}</code>
          {!me?.catalog_public && <p className="muted small">{t("notPublished")}</p>}
          <div className="row">
            <button type="button" className="btn btn-outline btn-sm" onClick={copy}>{t("copyLink")}</button>
            <a className="btn btn-outline btn-sm" href={waLink(shareText)} target="_blank" rel="noreferrer">{t("shareWa")}</a>
          </div>
          <Link className="btn btn-ghost btn-sm" to={`/c/${savedSlug}`}>{t("preview")} ›</Link>
        </>
      )}
    </form>
  );
}

export function Catalogue() {
  const { t } = useApp();
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    api.myProducts().then(setProducts);
  }, []);

  return (
    <Screen>
      <Header title={t("myCatalogue")} />
      <div className="stack">
        <ShareCard />
        <Link className="btn btn-accent" to="/catalog/new">{t("addProduct")}</Link>
        {products?.map((p) => (
          <Link key={p.id} to={`/catalog/${p.id}`} className={`card product-row ${p.is_active ? "" : "dim"}`}>
            <ProductPhoto product={p} />
            <div className="product-row-body">
              <strong>{p.name}</strong>
              {p.name_ta && <span className="muted small">{p.name_ta}</span>}
              <PriceLine product={p} />
              <span className="muted small">MOQ {p.moq} {t("pcs")}</span>
            </div>
            {!p.is_active && <span className="chip chip-soft">{t("hiddenTag")}</span>}
          </Link>
        ))}
        {products?.length === 0 && <p className="empty">{t("noProducts")}</p>}
      </div>
    </Screen>
  );
}
