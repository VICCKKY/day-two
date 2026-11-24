import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { Header, Screen } from "../components/Layout";
import { useApp } from "../context";
import { fmtDate, inr } from "../i18n";

export function Membership() {
  const { t, me, lang, refreshMe } = useApp();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);

  async function pay() {
    setBusy(true);
    try {
      await api.buyMembership();
      await refreshMe();
      nav("/wallet", { replace: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen nav={Boolean(me?.membership_active)}>
      <Header title={t("membershipTitle")} back={Boolean(me?.membership_active)} />
      <div className="stack">
        <div className="card price-card">
          <div className="price">{inr(3000)} <span>{t("perMonth")}</span></div>
          {me?.membership_active && (
            <p className="chip chip-verified">{t("activeUntil")} {fmtDate(lang, me.membership_until)}</p>
          )}
          <h3>{t("membershipGets")}</h3>
          <ul className="ticks">
            <li>{t("mGet1")}</li>
            <li>{t("mGet2")}</li>
            <li>{t("mGet3")}</li>
          </ul>
          <p className="note">{t("membershipNot")}</p>
        </div>
        <p className="fine">{t("demoPayNote")}</p>
        <button className="btn btn-primary" onClick={pay} disabled={busy}>
          {t("payDemo")} · {inr(3000)}
        </button>
      </div>
    </Screen>
  );
}
