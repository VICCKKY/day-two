import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { Header, Screen } from "../components/Layout";
import { useApp } from "../context";
import { fmtDate, inr } from "../i18n";
import type { Wallet as W } from "../types";

export function Wallet() {
  const { t, lang, refreshMe } = useApp();
  const [w, setW] = useState<W | null>(null);
  const [busy, setBusy] = useState("");

  useEffect(() => {
    api.wallet().then(setW);
  }, []);

  async function buy(code: string) {
    setBusy(code);
    try {
      setW(await api.buyPack(code));
      await refreshMe();
    } finally {
      setBusy("");
    }
  }

  if (!w) return <Screen><Header title={t("wallet")} /></Screen>;

  const names: Record<string, string> = { starter: "Starter", growth: "Growth", pro: "Pro" };

  return (
    <Screen>
      <Header title={t("wallet")} back />
      <div className="stack">
        <div className="card balance-card">
          <span className="muted">{t("balance")}</span>
          <div className="balance">{w.credits}</div>
          <span className="muted">{t("perLead")}</span>
        </div>
        {!w.membership_active && (
          <div className="card note-card">
            <p>{t("needMembership")}</p>
            <Link className="btn btn-accent" to="/membership">{t("renew")}</Link>
          </div>
        )}
        <h2>{t("packs")}</h2>
        {w.packs.map((p) => (
          <div key={p.code} className="card pack">
            <div>
              <strong>{names[p.code] ?? p.code}</strong>
              <p className="muted">{p.credits} leads</p>
            </div>
            <button className="btn btn-primary btn-sm" disabled={!w.membership_active || busy !== ""} onClick={() => buy(p.code)}>
              {inr(p.price_inr)}
            </button>
          </div>
        ))}
        {w.demo_payments && <p className="fine">{t("demoPayNote")}</p>}
        <h2>{t("history")}</h2>
        <ul className="history">
          {w.history.map((h) => (
            <li key={h.id}>
              <span>{h.kind} · {fmtDate(lang, h.created_at)}</span>
              <span className={h.credits_delta < 0 ? "neg" : "pos"}>
                {h.credits_delta !== 0 ? `${h.credits_delta > 0 ? "+" : ""}${h.credits_delta}` : inr(h.amount_inr)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Screen>
  );
}
