import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ApiError } from "../api";
import { Header, Screen, WalletPill } from "../components/Layout";
import { useApp } from "../context";
import { fmtDate, label } from "../i18n";
import type { LeadDetail as Lead } from "../types";

export function LeadDetail() {
  const { id } = useParams();
  const { t, lang, me, refreshMe } = useApp();
  const [lead, setLead] = useState<Lead | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.lead(Number(id)).then(setLead).catch((e: Error) => setError(e.message));
  }, [id]);

  async function unlock() {
    setError("");
    try {
      setLead(await api.unlock(Number(id)));
      await refreshMe();
    } catch (e) {
      setError(e instanceof ApiError && e.status === 402 ? t("needCredits") : e instanceof Error ? e.message : t("error"));
    } finally {
      setConfirming(false);
    }
  }

  if (!lead) return <Screen><Header title="" back />{error && <p className="error">{error}</p>}</Screen>;

  const wa = `https://wa.me/91${lead.buyer_phone}`;
  const blocker = !me?.membership_active ? "needMembership" : (me?.credits ?? 0) < 1 ? "needCredits" : null;

  return (
    <Screen>
      <Header title={lead.product} back right={<WalletPill />} />
      <div className="stack">
        <div className="card">
          <div className="lead-top">
            <span className="chip chip-soft">{label.buyer(lang, lead.buyer_type)}</span>
            <span className="chip chip-verified">✓ {t("verified")} · {fmtDate(lang, lead.verified_at)}</span>
          </div>
          <p className="muted">{lead.city} · {lead.category}</p>
          <dl className="facts">
            <dt>{t("quantity")}</dt><dd>{lead.quantity}</dd>
            <dt>{t("budget")}</dt><dd>{lead.budget || "—"}</dd>
            <dt>{t("neededBy")}</dt><dd>{fmtDate(lang, lead.needed_by)}</dd>
          </dl>
          {lead.notes && <p className="note">{lead.notes}</p>}
        </div>

        <div className={`card contact ${lead.unlocked ? "open" : "locked"}`}>
          <h3>{t("contact")}</h3>
          <p className="contact-name">{lead.buyer_name}</p>
          <p className="contact-phone">+91 {lead.buyer_phone}</p>
          {lead.unlocked && (
            <div className="row">
              <a className="btn btn-primary" href={`tel:+91${lead.buyer_phone}`}>{t("call")}</a>
              <a className="btn btn-outline" href={wa} target="_blank" rel="noreferrer">{t("whatsapp")}</a>
            </div>
          )}
        </div>

        {error && <p className="error">{error}</p>}

        {!lead.unlocked && (
          blocker ? (
            <div className="card note-card">
              <p>{t(blocker)}</p>
              <Link className="btn btn-accent" to={blocker === "needMembership" ? "/membership" : "/wallet"}>
                {blocker === "needMembership" ? t("renew") : t("goWallet")}
              </Link>
            </div>
          ) : (
            <button className="btn btn-accent sticky-cta" onClick={() => setConfirming(true)}>{t("unlockCta")}</button>
          )
        )}
      </div>

      {confirming && (
        <div className="sheet-backdrop" onClick={() => setConfirming(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h3>{t("unlockConfirmTitle")}</h3>
            <p className="muted">{t("unlockConfirmBody")}</p>
            <button className="btn btn-accent" onClick={unlock}>{t("confirm")}</button>
            <button className="btn btn-ghost" onClick={() => setConfirming(false)}>{t("cancel")}</button>
          </div>
        </div>
      )}
    </Screen>
  );
}
