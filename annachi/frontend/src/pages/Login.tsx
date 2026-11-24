import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { DemoBanner } from "../components/Layout";
import { useApp } from "../context";

export function Login() {
  const { t, login, lang, setLang } = useApp();
  const nav = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (step === "phone") {
        const r = await api.requestOtp(phone);
        setDemoOtp(r.demo_otp);
        setStep("otp");
      } else {
        const r = await api.verifyOtp(phone, otp);
        await login(r.access_token);
        nav("/", { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="screen login">
      <DemoBanner />
      <div className="login-hero">
        <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" width={64} height={64} />
        <div className="brand">Annachi <span>அண்ணாச்சி</span></div>
        <p className="tagline">{t("appTagline")}</p>
      </div>
      <form className="content" onSubmit={submit}>
        <h2>{t("loginTitle")}</h2>
        <p className="muted">{t("loginSub")}</p>
        <label className="field">
          <span>{t("phone")}</span>
          <div className="phone-input">
            <span>+91</span>
            <input
              inputMode="numeric" autoComplete="tel-national" maxLength={10} value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} disabled={step === "otp"} required
            />
          </div>
        </label>
        {step === "otp" && (
          <label className="field">
            <span>{t("otp")}</span>
            <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} required autoFocus />
            {demoOtp && <small className="hint">{t("demoOtpHint")}: {demoOtp}</small>}
          </label>
        )}
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary" disabled={busy || phone.length !== 10 || (step === "otp" && otp.length !== 6)}>
          {step === "phone" ? t("sendOtp") : t("verify")}
        </button>
        <p className="fine">{t("terms")}</p>
        <button type="button" className="link-btn" onClick={() => setLang(lang === "ta" ? "en" : "ta")}>
          {lang === "ta" ? "English" : "தமிழ்"}
        </button>
      </form>
    </div>
  );
}
