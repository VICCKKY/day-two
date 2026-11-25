import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { Header, Screen } from "../components/Layout";
import { useApp } from "../context";
import type { Key } from "../i18n";
import type { ProductInput } from "../types";

interface TierRow {
  min_qty: string;
  price: string;
}

interface FormState {
  name: string;
  name_ta: string;
  category: string;
  material: string;
  size: string;
  description: string;
  photos: string;
  price_from: string;
  moq: string;
  lead_time: string;
  is_active: boolean;
  tiers: TierRow[];
}

const EMPTY: FormState = {
  name: "", name_ta: "", category: "", material: "", size: "", description: "", photos: "",
  price_from: "", moq: "1", lead_time: "", is_active: true, tiers: [],
};

const digits = (v: string) => v.replace(/\D/g, "");
const numOrNull = (v: string) => (v.trim() === "" ? null : Number(v));

export function ProductForm() {
  const { id } = useParams();
  const editing = id !== undefined && id !== "new";
  const { t, me } = useApp();
  const nav = useNavigate();
  const [f, setF] = useState<FormState>({ ...EMPTY, category: me?.categories[0] ?? "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!editing) return;
    api.myProducts().then((list) => {
      const p = list.find((x) => x.id === Number(id));
      if (!p) return setError(t("error"));
      setF({
        name: p.name, name_ta: p.name_ta, category: p.category, material: p.material, size: p.size,
        description: p.description, photos: p.photo_urls.join("\n"), price_from: p.price_from_inr?.toString() ?? "",
        moq: String(p.moq), lead_time: p.lead_time_days?.toString() ?? "", is_active: p.is_active,
        tiers: p.bulk_tiers.map((x) => ({ min_qty: String(x.min_qty), price: String(x.price_per_piece_inr) })),
      });
    });
  }, [editing, id, t]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((prev) => ({ ...prev, [k]: v }));
  const setTier = (i: number, k: keyof TierRow, v: string) =>
    set("tiers", f.tiers.map((row, j) => (j === i ? { ...row, [k]: digits(v) } : row)));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const body: ProductInput = {
      name: f.name.trim(), name_ta: f.name_ta.trim(), category: f.category.trim(), material: f.material.trim(),
      size: f.size.trim(), description: f.description.trim(),
      photo_urls: f.photos.split("\n").map((x) => x.trim()).filter(Boolean),
      price_from_inr: numOrNull(f.price_from), moq: Number(f.moq || "1"), lead_time_days: numOrNull(f.lead_time),
      is_active: f.is_active,
      bulk_tiers: f.tiers
        .filter((r) => r.min_qty && r.price)
        .map((r) => ({ min_qty: Number(r.min_qty), price_per_piece_inr: Number(r.price) })),
    };
    try {
      if (editing) await api.updateProduct(Number(id), body);
      else await api.createProduct(body);
      nav("/catalog", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setBusy(false);
    }
  }

  const text = (k: "name" | "name_ta" | "category" | "material" | "size", label: Key, required = false) => (
    <label className="field">
      <span>{t(label)}</span>
      <input value={f[k]} onChange={(e) => set(k, e.target.value)} required={required} />
    </label>
  );
  const num = (k: "price_from" | "moq" | "lead_time", label: Key, required = false) => (
    <label className="field">
      <span>{t(label)}</span>
      <input inputMode="numeric" value={f[k]} onChange={(e) => set(k, digits(e.target.value))} required={required} />
    </label>
  );

  return (
    <Screen>
      <Header title={editing ? t("editProduct") : t("newProduct")} back />
      <form className="stack" onSubmit={submit}>
        {text("name", "nameEn", true)}
        {text("name_ta", "nameTa")}
        {text("category", "category", true)}
        <div className="row">
          {text("material", "material")}
          {text("size", "size")}
        </div>
        <label className="field">
          <span>{t("description")}</span>
          <textarea rows={3} value={f.description} onChange={(e) => set("description", e.target.value)} />
        </label>
        <label className="field">
          <span>{t("photoUrls")}</span>
          <textarea rows={2} value={f.photos} onChange={(e) => set("photos", e.target.value)} placeholder="https://…" />
        </label>
        <div className="row">
          {num("price_from", "priceFrom")}
          {num("moq", "moqPcs", true)}
        </div>

        <div className="card tiers">
          <h3>{t("bulkTiers")}</h3>
          <p className="hint">{t("bulkTiersHint")}</p>
          {f.tiers.map((row, i) => (
            <div className="tier-row" key={i}>
              <label className="field">
                <span>{t("minQty")}</span>
                <input inputMode="numeric" value={row.min_qty} onChange={(e) => setTier(i, "min_qty", e.target.value)} />
              </label>
              <label className="field">
                <span>{t("pricePerPiece")}</span>
                <input inputMode="numeric" value={row.price} onChange={(e) => setTier(i, "price", e.target.value)} />
              </label>
              <button type="button" className="icon-btn" aria-label={t("remove")}
                onClick={() => set("tiers", f.tiers.filter((_, j) => j !== i))}>×</button>
            </div>
          ))}
          {f.tiers.length < 10 && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => set("tiers", [...f.tiers, { min_qty: "", price: "" }])}>
              {t("addTier")}
            </button>
          )}
        </div>

        {num("lead_time", "leadTime")}
        <label className="toggle">
          <input type="checkbox" checked={f.is_active} onChange={(e) => set("is_active", e.target.checked)} />
          <span>{t("showInCatalogue")}</span>
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary" disabled={busy}>{t("save")}</button>
      </form>
    </Screen>
  );
}
