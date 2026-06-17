"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { postLoginDestination } from "@/lib/auth-routing";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { type LoginPayload } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function resolveError(err: unknown): string {
  if (err && typeof err === "object" && "isSessionError" in err)
    return "Signed in, but your session could not be loaded. Please try again.";
  if (axios.isAxiosError(err)) {
    if (!err.response) return "Unable to connect. Please try again.";
    if (err.response.status === 401) return "Invalid email/phone or password.";
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
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
      <path d="M2 10s3.333-5 8-5 8 5 8 5-3.333 5-8 5-8-5-8-5Z" />
      <circle cx="10" cy="10" r="2.5" />
    </svg>
  ) : (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
      <path d="M3 3l14 14M11.57 11.57A2.5 2.5 0 0 1 7.43 8.43M7.42 4.6C8.24 4.22 9.1 4 10 4c4.667 0 8 5 8 5a15.1 15.1 0 0 1-2.36 3.07M5.08 5.08A14.95 14.95 0 0 0 2 10s3.333 5 8 5c1.6 0 3.09-.45 4.38-1.19" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 animate-spin" aria-hidden>
      <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor"
        strokeWidth="2" strokeDasharray="25 27" strokeLinecap="round" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Field wrapper
// ─────────────────────────────────────────────────────────────────────────────

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-dim">{label}</label>
      {children}
      {error && <p className="text-xs" style={{ color: "#c48080" }}>{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Form
// ─────────────────────────────────────────────────────────────────────────────

interface FieldErrors { identifier?: string; password?: string }

const input = "w-full rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:opacity-35 focus:ring-1";
const inputStyle = { background: "#232323", color: "#E6E8E3", border: "1px solid rgba(232,237,234,0.10)" };

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const { t } = useI18n();

  const initialRegistered = useRef(searchParams.get("registered") === "1");
  const initialRedirect   = useRef(searchParams.get("redirect"));
  const [showRegisteredBanner, setShowRegisteredBanner] = useState(initialRegistered.current);

  useEffect(() => {
    if (!initialRegistered.current) return;
    const cleanUrl = initialRedirect.current
      ? `/auth/login?redirect=${encodeURIComponent(initialRedirect.current)}`
      : "/auth/login";
    router.replace(cleanUrl);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [identifier, setIdentifier]     = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [fieldErrors, setFieldErrors]   = useState<FieldErrors>({});
  const [formError, setFormError]       = useState<string | null>(null);

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
      router.push(postLoginDestination(searchParams.get("redirect"), user!.role));
    } catch (err) {
      setFormError(resolveError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="dark flex min-h-screen flex-col items-center justify-center px-5 py-14 bg-background">
      {/* Subtle ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 opacity-30"
        aria-hidden
        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,255,255,0.04), transparent 60%)" }}
      />

      <div className="relative z-10 w-full max-w-[400px]">
        {/* Top bar */}
        <header className="mb-9 flex items-center justify-between">
          <Link
            href="/"
            className="group inline-flex shrink-0 items-center gap-1.5 rounded text-xs text-dim transition-colors hover:text-nav-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 opacity-75 transition-[transform,opacity] group-hover:-translate-x-0.5 group-hover:opacity-100" aria-hidden>
              <path d="M9.5 3.5 5 8l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{t("auth.backHome")}</span>
          </Link>
          <Logo className="text-xl leading-none" variant="chrome" />
        </header>

        {/* Registered banner */}
        {showRegisteredBanner && (
          <div
            className="mb-6 flex items-start justify-between gap-3 rounded-xl px-4 py-3 text-sm"
            style={{
              background: "rgba(161,201,152,0.12)",
              border: "1px solid rgba(161,201,152,0.26)",
              color: "#A1C998",
            }}
          >
            <span>Account created. Please sign in.</span>
            <button
              type="button" aria-label="Dismiss"
              onClick={() => setShowRegisteredBanner(false)}
              className="mt-px shrink-0 rounded transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-sage"
              style={{ color: "#A1C998" }}
            >
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            </button>
          </div>
        )}

        {/* Heading */}
        <div className="mb-7">
          <h1 className="font-heading text-[1.6rem] font-semibold leading-tight tracking-[-0.018em] text-foreground">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-dim">Continue tracking recycling.</p>
        </div>

        {/* Form card */}
        <div
          className="rounded-3xl px-7 py-7"
          style={{
            background: "#1C1C1C",
            border: "1px solid rgba(232,237,234,0.08)",
            boxShadow: "0 4px 40px rgba(0,0,0,0.24)",
          }}
        >
          {formError && (
            <div className="mb-5 rounded-xl px-4 py-3 text-sm"
              style={{ background: "rgba(180,90,90,0.10)", border: "1px solid rgba(180,90,90,0.22)", color: "#c48080" }}>
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Field label="Email or phone" error={fieldErrors.identifier}>
              <input type="text" autoComplete="username" placeholder="you@example.com"
                value={identifier}
                onChange={(e) => { setIdentifier(e.target.value); if (fieldErrors.identifier) setFieldErrors((p) => ({ ...p, identifier: undefined })); }}
                className={cn(input, fieldErrors.identifier ? "ring-1 ring-[rgba(180,90,90,0.5)]" : "focus:ring-[rgba(161,201,152,0.36)]")}
                style={inputStyle}
              />
            </Field>

            <Field label="Password" error={fieldErrors.password}>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined })); }}
                  className={cn(input, "pr-10", fieldErrors.password ? "ring-1 ring-[rgba(180,90,90,0.5)]" : "focus:ring-[rgba(161,201,152,0.36)]")}
                  style={inputStyle}
                />
                <button type="button" aria-label={showPassword ? "Hide" : "Show"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-dim transition-opacity hover:opacity-80">
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </Field>

            <button type="submit" disabled={submitting}
              className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-55"
              style={{ background: "#A1C998", color: "#161615" }}
              onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = "#B0D4A8"; }}
              onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.background = "#A1C998"; }}
            >
              {submitting ? <><Spinner />Signing in…</> : "Sign in"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs leading-relaxed text-dim">
            Connected to verified recycling infrastructure.
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-dim">
          New to tareka.?{" "}
          <Link href="/auth/register" className="font-medium text-accent-sage-ink transition-opacity hover:opacity-80">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}