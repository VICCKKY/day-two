import { Link, useNavigate } from "react-router-dom";
import { STATIC_DEMO } from "../api";
import { resetDemo } from "../mockApi";
import { Header, Screen } from "../components/Layout";
import { useApp } from "../context";
import { fmtDate } from "../i18n";

export function Account() {
  const { t, me, lang, setLang, logout } = useApp();
  const nav = useNavigate();
  if (!me) return null;
  return (
    <Screen>
      <Header title={t("account")} />
      <div className="stack">
        <div className="card">
          <h3>{me.business_name}</h3>
          <p className="muted">{me.owner_name} · +91 {me.phone}</p>
          <p className="muted small">{me.categories.join(", ")} · {me.cities.join(", ")}</p>
          <Link className="btn btn-outline btn-sm" to="/profile">{t("editProfile")}</Link>
        </div>
        <div className="card row-between">
          <span>{t("membership")}</span>
          {me.membership_active ? (
            <span className="chip chip-verified">{t("activeUntil")} {fmtDate(lang, me.membership_until)}</span>
          ) : (
            <Link to="/membership" className="chip chip-accent">{t("renew")}</Link>
          )}
        </div>
        <Link className="card row-between" to="/wallet">
          <span>{t("wallet")}</span>
          <strong>{me.credits} {t("credits")}</strong>
        </Link>
        <div className="card row-between">
          <span>{t("language")}</span>
          <div className="segmented">
            <button className={lang === "ta" ? "on" : ""} onClick={() => setLang("ta")}>தமிழ்</button>
            <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>English</button>
          </div>
        </div>
        <button className="btn btn-ghost" onClick={() => { logout(); nav("/login"); }}>{t("logout")}</button>
        {STATIC_DEMO && (
          <button className="btn btn-ghost btn-sm" onClick={() => { resetDemo(); logout(); nav("/login"); }}>
            {t("resetDemo")}
          </button>
        )}
      </div>
    </Screen>
  );
}
