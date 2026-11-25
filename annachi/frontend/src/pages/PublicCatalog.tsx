import { useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { DemoBanner } from "../components/Layout";
import { PriceLine, ProductPhoto } from "../components/ProductTile";
import { useApp } from "../context";
import type { PublicCatalog as Catalog } from "../types";

/** Public page frame: no login, no bottom nav, language toggle. */
export function PublicFrame({ children }: { children: ReactNode }) {
  const { lang, setLang } = useApp();
  return (
    <div className="screen public">
      <DemoBanner />
      <div className="public-lang">
        <button className="link-btn" onClick={() => setLang(lang === "ta" ? "en" : "ta")}>
          {lang === "ta" ? "English" : "தமிழ்"}
        </button>
      </div>
      <main className="content">{children}</main>
    </div>
  );
}

export function useCatalog(slug: string | undefined) {
  const [cat, setCat] = useState<Catalog | null>(null);
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    if (!slug) return;
    api.publicCatalog(slug).then(setCat).catch(() => setMissing(true));
  }, [slug]);
  return { cat, missing };
}

export function PublicCatalog() {
  const { slug } = useParams();
  const { t, lang } = useApp();
  const { cat, missing } = useCatalog(slug);

  if (missing) return <PublicFrame><p className="empty">{t("catalogueNotFound")}</p></PublicFrame>;
  if (!cat) return <PublicFrame><div className="loading">…</div></PublicFrame>;

  return (
    <PublicFrame>
      <header className="supplier-head">
        <h1>{cat.business_name}</h1>
        {cat.cities.length > 0 && <p className="muted">{t("citiesServed")}: {cat.cities.join(", ")}</p>}
        {cat.moq && <p className="muted">{t("minOrder")}: {cat.moq}</p>}
      </header>
      <div className="product-grid">
        {cat.products.map((p) => (
          <Link key={p.id} to={`/c/${cat.slug}/p/${p.id}`} className="card product-tile">
            <ProductPhoto product={p} />
            <strong>{lang === "ta" && p.name_ta ? p.name_ta : p.name}</strong>
            <PriceLine product={p} />
            <span className="muted small">MOQ {p.moq} {t("pcs")}</span>
          </Link>
        ))}
      </div>
      {cat.products.length === 0 && <p className="empty">{t("noProducts")}</p>}
    </PublicFrame>
  );
}
