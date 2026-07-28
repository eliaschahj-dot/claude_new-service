"use client";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { Appbar, Tabbar } from "@/components/Chrome";
import { Logo } from "@/components/Logo";
import { useI18n } from "@/lib/i18n";

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.2C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.2C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

function LoginInner() {
  const { ui } = useI18n();
  const { status } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";

  // 이메일 인증코드(OTP) — 구글 차단 지역(중국 등)용
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [otpStep, setOtpStep] = useState<"email" | "code">("email");
  const [otpMsg, setOtpMsg] = useState<"" | "sent" | "fail" | "sendFail">("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === "authenticated") router.replace(next);
  }, [status, next, router]);

  async function sendCode() {
    const e = email.trim();
    if (!e || busy) return;
    setBusy(true);
    setOtpMsg("");
    try {
      const r = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: e }),
      });
      if (r.ok) { setOtpStep("code"); setOtpMsg("sent"); }
      else setOtpMsg("sendFail");
    } catch {
      setOtpMsg("sendFail");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode() {
    if (!/^\d{6}$/.test(code.trim()) || busy) return;
    setBusy(true);
    setOtpMsg("");
    try {
      const res = await signIn("email-otp", { email: email.trim(), code: code.trim(), redirect: false });
      if (res && !res.error) router.replace(next);
      else setOtpMsg("fail");
    } catch {
      setOtpMsg("fail");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Appbar titleKey="loginTitle" />
      <main className="home-main">
        <div className="card login-card">
          <span className="login-logo"><Logo size={52} /></span>
          <h2>K-Visa Assist</h2>
          <p className="muted">{ui("loginDesc")}</p>
          <button className="btn google-btn" onClick={() => signIn("google", { redirectTo: next })}>
            <GoogleMark />
            {ui("loginGoogle")}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", margin: "6px 0" }}>
            <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
            <span className="muted" style={{ fontSize: ".74rem" }}>{ui("orDivider")}</span>
            <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
          </div>

          <div style={{ width: "100%", textAlign: "left" }}>
            <b style={{ fontSize: ".86rem" }}>{ui("otpTitle")}</b>
            <p className="muted" style={{ fontSize: ".76rem", margin: "4px 0 10px" }}>{ui("otpDesc")}</p>
            {otpStep === "email" ? (
              <div style={{ display: "flex", gap: 8 }}>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendCode()}
                  placeholder={ui("otpEmailPh")} disabled={busy} autoComplete="email"
                  style={{ flex: 1, border: "1px solid var(--line)", borderRadius: 10, padding: "11px 14px", fontSize: ".86rem", outline: "none", background: "var(--bg)" }} />
                <button className="btn btn-primary" style={{ width: "auto", padding: "0 16px", whiteSpace: "nowrap" }}
                  onClick={sendCode} disabled={busy || !email.trim()}>
                  {ui("otpSend")}
                </button>
              </div>
            ) : (
              <>
                <p className="muted" style={{ fontSize: ".76rem", marginBottom: 8 }}>{email}</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <input inputMode="numeric" maxLength={6} value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={(e) => e.key === "Enter" && verifyCode()}
                    placeholder={ui("otpCodePh")} disabled={busy} autoComplete="one-time-code"
                    style={{ flex: 1, border: "1px solid var(--line)", borderRadius: 10, padding: "11px 14px", fontSize: "1rem", letterSpacing: 4, outline: "none", background: "var(--bg)" }} />
                  <button className="btn btn-primary" style={{ width: "auto", padding: "0 16px", whiteSpace: "nowrap" }}
                    onClick={verifyCode} disabled={busy || code.trim().length !== 6}>
                    {ui("otpVerify")}
                  </button>
                </div>
                <button className="muted" style={{ background: "none", border: "none", fontSize: ".74rem", marginTop: 8, cursor: "pointer", textDecoration: "underline" }}
                  onClick={() => { setOtpStep("email"); setCode(""); setOtpMsg(""); }}>
                  ← {ui("otpEmailPh")}
                </button>
              </>
            )}
            {otpMsg === "sent" && <p style={{ fontSize: ".76rem", color: "#166534", marginTop: 8 }}>{ui("otpSent")}</p>}
            {otpMsg === "fail" && <p style={{ fontSize: ".76rem", color: "#b91c1c", marginTop: 8 }}>{ui("otpFail")}</p>}
            {otpMsg === "sendFail" && <p style={{ fontSize: ".76rem", color: "#b91c1c", marginTop: 8 }}>{ui("otpSendFail")}</p>}
          </div>

          <p className="muted" style={{ fontSize: ".76rem" }}>{ui("loginNote")}</p>
        </div>
        <p className="disclaimer">{ui("myDisclaimer")}</p>
      </main>
      <Tabbar />
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
