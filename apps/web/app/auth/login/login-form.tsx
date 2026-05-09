"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { AuthIllustrationPanel } from "@/app/auth/illustration-panel";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { type LoginPayload } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth";
import type { UserRole } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// Role → redirect
// ─────────────────────────────────────────────────────────────────────────────

function roleRoute(role: UserRole): string {
  switch (role) {
    case "recycler":       return "/recycler/dashboard";
    case "operator":       return "/operator/quick-log";
    case "company_admin":  return "/company/dashboard";
    case "platform_admin": return "/admin";
    default:               return "/recycler/dashboard";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Axios → user-facing message
// ─────────────────────────────────────────────────────────────────────────────

function resolveError(err: unknown): string {
  // Session-fetch wrapper thrown by authService.login after a successful POST
  // /auth/login but a failed GET /auth/me (e.g. cookie not delivered).
  if (err && typeof err === "object" && "isSessionError" in err) {
    return "Signed in, but your session could not be loaded. Please try again.";
  }
  if (axios.isAxiosError(err)) {
    if (!err.response) return "Unable to connect. Please try again.";
    if (err.response.status === 401) return "Invalid email/phone or password.";
    // Backend uses {"error":{"message":"..."}} — fall back to detail (FastAPI default).
    return (
      err.response.data?.error?.message ??
      err.response.data?.detail ??
      "Something went wrong. Please try again."
    );
  }
  return "Something went wrong. Please try again.";
}

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
      <path d="M2 10s3.333-5 8-5 8 5 8 5-3.333 5-8 5-8-5-8-5Z" />
      <circle cx="10" cy="10" r="2.5" />
    </svg>
  ) : (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
      <path d="M3 3l14 14M11.57 11.57A2.5 2.5 0 0 1 7.43 8.43M7.42 4.6C8.24 4.22 9.1 4 10 4c4.667 0 8 5 8 5a15.1 15.1 0 0 1-2.36 3.07M5.08 5.08A14.95 14.95 0 0 0 2 10s3.333 5 8 5c1.6 0 3.09-.45 4.38-1.19" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" aria-hidden>
      <path d="M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.77h5.4a4.62 4.62 0 0 1-2 3.04v2.5h3.23c1.9-1.74 3-4.31 3-7.31Z" fill="#4285F4" />
      <path d="M10 20c2.7 0 4.97-.9 6.63-2.46l-3.23-2.5c-.9.6-2.04.96-3.4.96-2.6 0-4.81-1.76-5.6-4.12H1.07v2.58A10 10 0 0 0 10 20Z" fill="#34A853" />
      <path d="M4.4 11.88A6.01 6.01 0 0 1 4.08 10c0-.65.11-1.28.32-1.88V5.54H1.07A10 10 0 0 0 0 10c0 1.61.38 3.14 1.07 4.46l3.33-2.58Z" fill="#FBBC05" />
      <path d="M10 3.96c1.47 0 2.79.5 3.82 1.5l2.86-2.86C14.96.9 12.7 0 10 0A10 10 0 0 0 1.07 5.54l3.33 2.58C5.19 5.72 7.4 3.96 10 3.96Z" fill="#EA4335" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 animate-spin" aria-hidden>
      <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="25 27" strokeLinecap="round" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Field wrapper
// ─────────────────────────────────────────────────────────────────────────────

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-dim">
        {label}
      </label>
      {children}
      {error && <p className="text-xs" style={{ color: "#c48080" }}>{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Login form
// ─────────────────────────────────────────────────────────────────────────────

interface FieldErrors { identifier?: string; password?: string }

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const { t } = useI18n();

  // Capture URL params once at init — these don't change during a render cycle.
  const initialRegistered = useRef(searchParams.get("registered") === "1");
  const initialRedirect    = useRef(searchParams.get("redirect"));

  // Banner is driven by local state so it stays visible on the first render
  // but is gone after a hard refresh (URL has been cleaned by then).
  const [showRegisteredBanner, setShowRegisteredBanner] = useState(initialRegistered.current);

  // On mount: strip ?registered=1 from the URL while preserving ?redirect=…
  useEffect(() => {
    if (!initialRegistered.current) return;
    const cleanUrl = initialRedirect.current
      ? `/auth/login?redirect=${encodeURIComponent(initialRedirect.current)}`
      : "/auth/login";
    router.replace(cleanUrl);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [googleNotice, setGoogleNotice] = useState(false);

  function validate(): FieldErrors {
    const e: FieldErrors = {};
    if (!identifier.trim()) e.identifier = "Email or phone is required.";
    if (!password) e.password = "Password is required.";
    else if (password.length < 8) e.password = "Password must be at least 8 characters.";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const errors = validate();
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }
    setFieldErrors({});
    setSubmitting(true);
    try {
      const trimmed = identifier.trim();
      const payload: LoginPayload = trimmed.includes("@")
        ? { email: trimmed, password }
        : { phone: trimmed, password };
      await login(payload);
      const user = useAuthStore.getState().user;
      router.push(searchParams.get("redirect") ?? roleRoute(user!.role));
    } catch (err) {
      setFormError(resolveError(err));
    } finally {
      setSubmitting(false);
    }
  }

  const input = "w-full rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:opacity-35 focus:ring-1";
  const inputStyle = { background: "#232323", color: "#E6E8E3", border: "1px solid rgba(232,237,234,0.10)" };

  return (
    // ── True 50/50 split — .dark wrapper so CSS tokens resolve correctly ───────
    <div className="dark flex min-h-screen flex-col lg:flex-row">

      {/* Left — illustration panel (fades into form surface) */}
      <AuthIllustrationPanel />

      {/* Right — full-height matte charcoal */}
      <div
        className="relative flex w-full flex-col items-center justify-center
                   px-6 py-12 sm:px-10
                   lg:w-1/2 lg:min-h-screen lg:px-14"
        style={{ background: "#121212" }}
      >
        <div className="relative w-full max-w-[400px]">
        <header className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <Link
            href="/"
            className="group inline-flex shrink-0 items-center gap-1.5 rounded text-xs text-[#72776f] transition-colors hover:text-[#A8BFA6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(168,191,166,0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#121212]"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 opacity-75 transition-[transform,opacity] group-hover:-translate-x-0.5 group-hover:opacity-100" aria-hidden>
              <path d="M9.5 3.5 5 8l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{t("auth.backHome")}</span>
          </Link>
          <Logo className="text-xl leading-none sm:ml-0.5" variant="chrome" />
        </header>

          {/* Registration success banner — visible once, gone after refresh */}
          {showRegisteredBanner && (
            <div
              className="mb-6 flex items-start justify-between gap-3 rounded-xl px-4 py-3 text-sm"
              style={{
                background: "rgba(168,191,166,0.12)",
                border: "1px solid rgba(168,191,166,0.26)",
                color: "#A8BFA6",
              }}
            >
              <span>Account created. Please sign in.</span>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => setShowRegisteredBanner(false)}
                className="mt-px shrink-0 rounded transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#A8BFA6]"
                style={{ color: "#A8BFA6" }}
              >
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                  <path d="M3 3l10 10M13 3L3 13" />
                </svg>
              </button>
            </div>
          )}

          {/* Heading */}
          <div className="mb-7">
            <h1 className="font-heading text-[1.6rem] font-semibold leading-tight tracking-[-0.018em]" style={{ color: "#E6E8E3" }}>
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-dim">
              Continue tracking recycling.
            </p>
          </div>

          {/* Form card — rounded-3xl, neutral charcoal */}
          <div
            className="rounded-3xl px-7 py-7"
            style={{
              background: "#1C1C1C",
              border: "1px solid rgba(232,237,234,0.08)",
              boxShadow: "0 4px 40px rgba(0,0,0,0.24)",
            }}
          >
            {/* Error banner */}
            {formError && (
              <div
                className="mb-5 rounded-xl px-4 py-3 text-sm"
                style={{ background: "rgba(180,90,90,0.10)", border: "1px solid rgba(180,90,90,0.22)", color: "#c48080" }}
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <Field label="Email or phone" error={fieldErrors.identifier}>
                <input
                  type="text" autoComplete="username" placeholder="you@example.com"
                  value={identifier}
                  onChange={(e) => { setIdentifier(e.target.value); if (fieldErrors.identifier) setFieldErrors((p) => ({ ...p, identifier: undefined })); }}
                  className={cn(input, fieldErrors.identifier ? "ring-1 ring-[rgba(180,90,90,0.5)]" : "focus:ring-[rgba(168,191,166,0.36)]")}
                  style={inputStyle}
                />
              </Field>

              <Field label="Password" error={fieldErrors.password}>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined })); }}
                    className={cn(input, "pr-10", fieldErrors.password ? "ring-1 ring-[rgba(180,90,90,0.5)]" : "focus:ring-[rgba(168,191,166,0.36)]")}
                    style={inputStyle}
                  />
                  <button type="button" aria-label={showPassword ? "Hide" : "Show"} onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-dim transition-opacity hover:opacity-80"
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </Field>

              <div className="flex justify-end">
                <Link href="/auth/forgot-password" className="text-xs transition-opacity hover:opacity-75" style={{ color: "#A8BFA6" }}>
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit" disabled={submitting}
                className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-55"
                style={{ background: "#A8BFA6", color: "#161615" }}
                onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = "#B7C9B5"; }}
                onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.background = "#A8BFA6"; }}
              >
                {submitting ? <><Spinner />Signing in…</> : "Sign in"}
              </button>
            </form>

            {/* Supporting text */}
<p className="mt-5 text-center text-xs leading-relaxed text-dim">
  Connected to verified recycling infrastructure.
</p>
</div>

{/* Sign up */}
<p className="mt-6 text-center text-sm text-dim">
  New to tareka?{" "}
  <Link
    href="/auth/register"
    className="font-medium transition-opacity hover:opacity-80"
    style={{ color: "#A8BFA6" }}
  >
    Create an account
  </Link>
</p>
        </div>
      </div>
    </div>
  );
}
