import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { Header, Screen } from "../components/Layout";
import { useApp } from "../context";

const list = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

export function Profile() {
  const { t, me, lang, refreshMe } = useApp();
  const nav = useNavigate();
  const [f, setF] = useState({
    business_name: me?.business_name ?? "",
    owner_name: me?.owner_name ?? "",
    gstin: me?.gstin ?? "",
    categories: (me?.categories ?? []).join(", "),
    cities: (me?.cities ?? []).join(", "),
    moq: me?.moq ?? "",
  });
  const [error, setError] = useState("");
  const first = !me?.profile_complete;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.saveProfile({ ...f, gstin: f.gstin.toUpperCase(), categories: list(f.categories), cities: list(f.cities), language: lang });
      await refreshMe();
      nav(first ? "/membership" : "/account", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    }
  }

  const input = (key: keyof typeof f, labelKey: Parameters<typeof t>[0], hint?: string, required = true) => (
    <label className="field">
      <span>{t(labelKey)}</span>
      <input value={f[key]} onChange={(e) => setF({ ...f, [key]: e.target.value })} required={required} />
      {hint && <small className="hint">{hint}</small>}
    </label>
  );

  return (
    <Screen nav={!first}>
      <Header title={t("profileTitle")} back={!first} />
      <form onSubmit={submit} className="stack">
        <p className="muted">{t("profileSub")}</p>
        {input("business_name", "businessName")}
        {input("owner_name", "ownerName")}
        {input("gstin", "gstin", undefined, false)}
        {input("categories", "categories", `${t("commaHint")} · Edible oil, Textiles`)}
        {input("cities", "cities", `${t("commaHint")} · Madurai, Salem`)}
        {input("moq", "moq", undefined, false)}
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary">{t("save")}</button>
      </form>
    </Screen>
  );
}
