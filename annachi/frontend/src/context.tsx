import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, getToken, setToken } from "./api";
import { translate, type Key, type Lang } from "./i18n";
import type { Me } from "./types";

interface AppState {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: Key) => string;
  me: Me | null;
  loading: boolean;
  refreshMe: () => Promise<void>;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AppState | null>(null);

function savedLang(): Lang {
  try {
    return localStorage.getItem("annachi_lang") === "en" ? "en" : "ta";
  } catch {
    return "ta";
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(savedLang);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(getToken()));

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    document.documentElement.lang = l;
    try {
      localStorage.setItem("annachi_lang", l);
    } catch {
      /* ignore */
    }
  }, []);

  const refreshMe = useCallback(async () => {
    if (!getToken()) {
      setMe(null);
      setLoading(false);
      return;
    }
    try {
      setMe(await api.me());
    } catch {
      setToken(null);
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(
    async (token: string) => {
      setToken(token);
      setLoading(true);
      await refreshMe();
    },
    [refreshMe],
  );

  const logout = useCallback(() => {
    setToken(null);
    setMe(null);
  }, []);

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  const t = useCallback((k: Key) => translate(lang, k), [lang]);

  return (
    <Ctx.Provider value={{ lang, setLang, t, me, loading, refreshMe, login, logout }}>{children}</Ctx.Provider>
  );
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp outside AppProvider");
  return v;
}
