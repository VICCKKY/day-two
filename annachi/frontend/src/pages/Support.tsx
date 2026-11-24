import { Header, Screen } from "../components/Layout";
import { useApp } from "../context";

// MVP: WhatsApp support instead of the AI chat (spec section 6). Set the team number before going live.
const SUPPORT_WA = "https://wa.me/";

export function Support() {
  const { t } = useApp();
  return (
    <Screen>
      <Header title={t("support")} />
      <div className="stack">
        <div className="card">
          <h3>{t("supportTitle")}</h3>
          <p className="muted">{t("supportBody")}</p>
          <a className="btn btn-primary" href={SUPPORT_WA} target="_blank" rel="noreferrer">{t("whatsapp")}</a>
        </div>
        <div className="card managed">
          <h3>{t("managedTitle")}</h3>
          <p>{t("managedBody")}</p>
          <p className="muted small">{t("qualified")}</p>
          <a className="btn btn-accent" href={SUPPORT_WA} target="_blank" rel="noreferrer">{t("requestCallback")}</a>
        </div>
      </div>
    </Screen>
  );
}
