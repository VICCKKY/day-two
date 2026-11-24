import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useApp } from "../context";

export function DemoBanner() {
  const { t } = useApp();
  return <div className="demo-banner">{t("demoBanner")}</div>;
}

export function Header({ title, back, right }: { title: string; back?: boolean; right?: ReactNode }) {
  const nav = useNavigate();
  const { t } = useApp();
  return (
    <header className="header">
      {back && (
        <button className="icon-btn" onClick={() => nav(-1)} aria-label={t("back")}>
          ‹
        </button>
      )}
      <h1>{title}</h1>
      <div className="header-right">{right}</div>
    </header>
  );
}

export function WalletPill() {
  const { me, t } = useApp();
  const nav = useNavigate();
  return (
    <button className="wallet-pill" onClick={() => nav("/wallet")}>
      <span className="coin" aria-hidden>●</span> {me?.credits ?? 0} {t("credits")}
    </button>
  );
}

export function BottomNav() {
  const { t } = useApp();
  const items: [string, string, string][] = [
    ["/", "◫", t("leads")],
    ["/my-leads", "☰", t("myLeads")],
    ["/support", "✆", t("support")],
    ["/account", "◉", t("account")],
  ];
  return (
    <nav className="bottom-nav">
      {items.map(([to, icon, text]) => (
        <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => (isActive ? "active" : "")}>
          <span className="nav-icon" aria-hidden>{icon}</span>
          <span>{text}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export function Screen({ children, nav = true }: { children: ReactNode; nav?: boolean }) {
  return (
    <div className="screen">
      <DemoBanner />
      <main className={nav ? "content with-nav" : "content"}>{children}</main>
      {nav && <BottomNav />}
    </div>
  );
}
