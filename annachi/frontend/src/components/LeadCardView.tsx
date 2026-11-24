import { Link } from "react-router-dom";
import { useApp } from "../context";
import { fmtDate, label } from "../i18n";
import type { LeadCard } from "../types";

export function LeadCardView({ lead }: { lead: LeadCard }) {
  const { lang, t } = useApp();
  return (
    <Link to={`/lead/${lead.id}`} className="card lead-card">
      <div className="lead-top">
        <span className="chip chip-soft">{label.buyer(lang, lead.buyer_type)}</span>
        {lead.unlocked ? (
          <span className="chip chip-accent">{t("unlockedTag")}</span>
        ) : (
          <span className="chip chip-verified" title={fmtDate(lang, lead.verified_at)}>
            ✓ {t("verified")}
          </span>
        )}
      </div>
      <h3>{lead.product}</h3>
      <p className="muted">
        {lead.city} · {lead.category}
      </p>
      <div className="lead-facts">
        <div>
          <span className="fact-label">{t("quantity")}</span>
          <strong>{lead.quantity}</strong>
        </div>
        <div>
          <span className="fact-label">{t("budget")}</span>
          <strong>{lead.budget || "—"}</strong>
        </div>
        <div>
          <span className="fact-label">{t("neededBy")}</span>
          <strong>{fmtDate(lang, lead.needed_by)}</strong>
        </div>
      </div>
    </Link>
  );
}
