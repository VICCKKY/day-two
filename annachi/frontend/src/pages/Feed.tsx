import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { Header, Screen, WalletPill } from "../components/Layout";
import { LeadCardView } from "../components/LeadCardView";
import { useApp } from "../context";
import type { LeadCard } from "../types";

export function Feed() {
  const { t, me } = useApp();
  const [all, setAll] = useState<LeadCard[]>([]);
  const [q, setQ] = useState("");
  const [mineOnly, setMineOnly] = useState(false);
  const [category, setCategory] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      api.leads({ q, mine_only: mineOnly }).then((l) => {
        setAll(l);
        setLoaded(true);
      });
    }, 200);
    return () => clearTimeout(id);
  }, [q, mineOnly]);

  const categories = useMemo(() => Array.from(new Set(all.map((l) => l.category))).sort(), [all]);
  const shown = category ? all.filter((l) => l.category === category) : all;

  return (
    <Screen>
      <Header title={`${t("leads")}`} right={<WalletPill />} />
      <p className="greeting muted">{me?.business_name}</p>
      <input className="search" placeholder={t("search")} value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="chips">
        <button className={`chip-btn ${mineOnly ? "on" : ""}`} onClick={() => setMineOnly(!mineOnly)}>
          {t("forMe")}
        </button>
        <button className={`chip-btn ${category === "" ? "on" : ""}`} onClick={() => setCategory("")}>
          {t("all")}
        </button>
        {categories.map((c) => (
          <button key={c} className={`chip-btn ${category === c ? "on" : ""}`} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>
      <div className="stack">
        {shown.map((l) => (
          <LeadCardView key={l.id} lead={l} />
        ))}
        {loaded && shown.length === 0 && <p className="empty">{t("noLeads")}</p>}
      </div>
    </Screen>
  );
}
