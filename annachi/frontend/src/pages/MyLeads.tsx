import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { Header, Screen } from "../components/Layout";
import { useApp } from "../context";
import { REASONS, STATUSES, fmtDate, inr, label } from "../i18n";
import type { Funnel, LeadStatus, MyLead, ReportReason } from "../types";

function Row({ item, onChange }: { item: MyLead; onChange: () => void }) {
  const { t, lang } = useApp();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(item.notes);
  const [value, setValue] = useState(item.order_value_inr?.toString() ?? "");
  const [reason, setReason] = useState<ReportReason>("wrong_number");
  const [error, setError] = useState("");

  const patch = async (p: Parameters<typeof api.updateMyLead>[1]) => {
    await api.updateMyLead(item.unlock_id, p);
    onChange();
  };

  const report = async () => {
    setError("");
    try {
      await api.report(item.unlock_id, reason, "");
      onChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("error"));
    }
  };

  return (
    <div className="card my-lead">
      <button className="my-lead-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <div>
          <strong>{item.product_name ?? item.lead.product}</strong>
          <p className="muted">{item.lead.buyer_name} · {item.lead.city} · {item.lead.quantity}</p>
          <div className="chips wrap">
            <span className={`chip ${item.source === "catalog_quote" ? "chip-accent" : "chip-verified"}`}>
              {item.source === "catalog_quote" ? t("sourceCatalog") : t("sourceVerified")}
            </span>
            {item.source === "catalog_quote" && !item.is_verified && <span className="chip chip-warn">{t("notVerified")}</span>}
          </div>
        </div>
        <span className={`status status-${item.status}`}>{label.status(lang, item.status)}</span>
      </button>
      {item.follow_up_date && <p className="muted small">{t("followUp")}: {fmtDate(lang, item.follow_up_date)}</p>}
      {open && (
        <div className="stack tight">
          <div className="row">
            <a className="btn btn-primary btn-sm" href={`tel:+91${item.lead.buyer_phone}`}>{t("call")}</a>
            <a className="btn btn-outline btn-sm" href={`https://wa.me/91${item.lead.buyer_phone}`} target="_blank" rel="noreferrer">{t("whatsapp")}</a>
          </div>
          <div className="chips wrap">
            {STATUSES.map((s: LeadStatus) => (
              <button key={s} className={`chip-btn ${item.status === s ? "on" : ""}`} onClick={() => patch({ status: s })}>
                {label.status(lang, s)}
              </button>
            ))}
          </div>
          <label className="field">
            <span>{t("followUp")}</span>
            <input type="date" value={item.follow_up_date ?? ""} onChange={(e) => patch({ follow_up_date: e.target.value || null })} />
          </label>
          <label className="field">
            <span>{t("notes")}</span>
            <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => notes !== item.notes && patch({ notes })} />
          </label>
          {item.status === "won" && (
            <label className="field">
              <span>{t("orderValue")}</span>
              <input inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
                onBlur={() => patch({ order_value_inr: value ? Number(value) : null })} />
            </label>
          )}
          {item.report_status ? (
            <p className="chip chip-soft">{t("reported")}: {item.report_status}</p>
          ) : (
            <div className="report">
              <select value={reason} onChange={(e) => setReason(e.target.value as ReportReason)}>
                {REASONS.map((r) => <option key={r} value={r}>{label.reason(lang, r)}</option>)}
              </select>
              <button className="btn btn-ghost btn-sm" onClick={report}>{t("reportBad")}</button>
            </div>
          )}
          {error && <p className="error">{error}</p>}
        </div>
      )}
    </div>
  );
}

export function MyLeads() {
  const { t } = useApp();
  const [items, setItems] = useState<MyLead[] | null>(null);
  const [funnel, setFunnel] = useState<Funnel | null>(null);

  const load = useCallback(() => {
    api.myLeads().then(setItems);
    api.funnel().then(setFunnel);
  }, []);
  useEffect(load, [load]);

  return (
    <Screen>
      <Header title={t("myLeads")} />
      {funnel && (
        <div className="card funnel">
          <h3>{t("funnel")}</h3>
          <div className="funnel-row">
            <div><strong>{funnel.unlocked}</strong><span>Unlocked</span></div>
            <div><strong>{funnel.called}</strong><span>Called</span></div>
            <div><strong>{funnel.quote_sent}</strong><span>Quote</span></div>
            <div><strong>{funnel.won}</strong><span>Won</span></div>
          </div>
          {funnel.won_value_inr > 0 && <p className="muted small">Won value: {inr(funnel.won_value_inr)}</p>}
          <p className="muted small">
            {t("sourceVerified")}: {funnel.by_source.annachi_verified ?? 0} · {t("sourceCatalog")}: {funnel.by_source.catalog_quote ?? 0}
          </p>
        </div>
      )}
      <div className="stack">
        {items?.map((i) => <Row key={i.unlock_id} item={i} onChange={load} />)}
        {items?.length === 0 && <p className="empty">{t("emptyMyLeads")}</p>}
      </div>
    </Screen>
  );
}
