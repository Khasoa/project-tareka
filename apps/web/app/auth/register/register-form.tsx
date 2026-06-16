"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/logo";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { cn } from "@/lib/utils";
import { authService, type LoginPayload, type RegisterPayload } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth";
import type { UserRole } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
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

function resolveRegisterError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) return "Unable to connect. Please try again.";
    const status = err.response.status;
    if (status === 409) return "An account with this email or phone already exists.";
    if (status === 422) {
      const detail = err.response.data?.detail;
      if (Array.isArray(detail) && detail[0]?.msg) return String(detail[0].msg);
      return "Please check your information and try again.";
    }
    if (status === 429) return "Too many attempts. Please wait a moment and try again.";
    return (
      err.response.data?.error?.message ??
      err.response.data?.detail ??
      "We couldn't create your account. Please try again."
    );
  }
  return "We couldn't create your account. Please try again.";
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

interface FieldErrors {
  fullName?: string;
  identifier?: string;
  password?: string;
  confirmPassword?: string;
}

const input = "w-full rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:opacity-35 focus:ring-1";
const inputStyle = { background: "#232323", color: "#E6E8E3", border: "1px solid rgba(232,237,234,0.10)" };

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const { t } = useI18n();

  const [fullName, setFullName]             = useState("");
  const [identifier, setIdentifier]         = useState("");
  const [password, setPassword]             = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword]     = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [submitting, setSubmitting]         = useState(false);
  const [fieldErrors, setFieldErrors]       = useState<FieldErrors>({});
  const [formError, setFormError]           = useState<string | null>(null);
  const [googleNotice, setGoogleNotice]     = useState(false);

  function clearField(k: keyof FieldErrors) {
    setFieldErrors((p) => ({ ...p, [k]: undefined }));
  }

  function validate(): FieldErrors {
    const e: FieldErrors = {};
    if (!fullName.trim()) e.fullName = "Enter your full name.";
    else if (fullName.trim().length < 2) e.fullName = "Name must be at least 2 characters.";
    if (!identifier.trim()) e.identifier = "Enter an email or phone number.";
    if (!password) e.password = "Enter a password.";
    else if (password.length < 8) e.password = "Password must be at least 8 characters.";
    if (!confirmPassword) e.confirmPassword = "Please confirm your password.";
    else if (password !== confirmPassword) e.confirmPassword = "Passwords do not match.";
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
      const registerPayload: RegisterPayload = {
        full_name: fullName.trim(),
        password,
        ...(trimmed.includes("@") ? { email: trimmed } : { phone: trimmed }),
      };
      await authService.register(registerPayload);
      const loginPayload: LoginPayload = trimmed.includes("@")
        ? { email: trimmed, password }
        : { phone: trimmed, password };
      try {
        await login(loginPayload);
        const user = useAuthStore.getState().user;
        const dest = searchParams.get("redirect") ?? roleRoute(user!.role);
        router.push(dest);
      } catch {
        router.push("/auth/login?registered=1");
      }
    } catch (err) {
      setFormError(resolveRegisterError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="dark flex min-h-screen flex-col items-center justify-center px-5 py-14 bg-background">
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 opacity-30"
        aria-hidden
        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,255,255,0.04), transparent 60%)" }}
      />

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Top bar */}
        <header className="mb-9 flex items-center justify-between">
          <Link href="/"
            className="group inline-flex shrink-0 items-center gap-1.5 rounded text-xs text-dim transition-colors hover:text-nav-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 opacity-75 transition-[transform,opacity] group-hover:-translate-x-0.5 group-hover:opacity-100" aria-hidden>
              <path d="M9.5 3.5 5 8l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{t("auth.backHome")}</span>
          </Link>
          <Logo className="text-xl leading-none" variant="chrome" />
        </header>

        {/* Heading */}
        <div className="mb-7">
          <h1 className="font-heading text-[1.6rem] font-semibold leading-tight tracking-[-0.018em] text-foreground">
            Create your account
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-dim">
            Start tracking verified recycling contributions.
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-3xl px-7 py-7"
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
            <Field label="Full name" error={fieldErrors.fullName}>
              <input type="text" autoComplete="name" placeholder="Amara Osei"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); clearField("fullName"); }}
                className={cn(input, fieldErrors.fullName ? "ring-1 ring-[rgba(180,90,90,0.5)]" : "focus:ring-[rgba(161,201,152,0.36)]")}
                style={inputStyle}
              />
            </Field>

            <Field label="Email or phone" error={fieldErrors.identifier}>
              <input type="text" autoComplete="username" placeholder="you@example.com"
                value={identifier}
                onChange={(e) => { setIdentifier(e.target.value); clearField("identifier"); }}
                className={cn(input, fieldErrors.identifier ? "ring-1 ring-[rgba(180,90,90,0.5)]" : "focus:ring-[rgba(161,201,152,0.36)]")}
                style={inputStyle}
              />
            </Field>

            <Field label="Password" error={fieldErrors.password}>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearField("password"); }}
                  className={cn(input, "pr-10", fieldErrors.password ? "ring-1 ring-[rgba(180,90,90,0.5)]" : "focus:ring-[rgba(161,201,152,0.36)]")}
                  style={inputStyle}
                />
                <button type="button" aria-label={showPassword ? "Hide" : "Show"} onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-dim transition-opacity hover:opacity-80">
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </Field>

            <Field label="Confirm password" error={fieldErrors.confirmPassword}>
              <div className="relative">
                <input type={showConfirm ? "text" : "password"} autoComplete="new-password" placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); clearField("confirmPassword"); }}
                  className={cn(input, "pr-10", fieldErrors.confirmPassword ? "ring-1 ring-[rgba(180,90,90,0.5)]" : "focus:ring-[rgba(161,201,152,0.36)]")}
                  style={inputStyle}
                />
                <button type="button" aria-label={showConfirm ? "Hide" : "Show"} onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-dim transition-opacity hover:opacity-80">
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
            </Field>

            <button type="submit" disabled={submitting}
              className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-55"
              style={{ background: "#A1C998", color: "#161615" }}
              onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = "#B0D4A8"; }}
              onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.background = "#A1C998"; }}
            >
              {submitting ? <><Spinner />Creating account…</> : "Create account"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "rgba(232,237,234,0.08)" }} />
            <span className="text-[11px] text-dim">or</span>
            <div className="h-px flex-1" style={{ background: "rgba(232,237,234,0.08)" }} />
          </div>

          {/* Google (stub) */}
          <button type="button" aria-label="Continue with Google (not available)"
            onClick={() => setGoogleNotice(true)}
            className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: "transparent", border: "1px solid rgba(232,237,234,0.12)", color: "var(--text-dim)", opacity: 0.7 }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.borderColor = "rgba(232,237,234,0.20)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.7"; e.currentTarget.style.borderColor = "rgba(232,237,234,0.12)"; }}
          >
            <GoogleIcon />
            Continue with Google
          </button>
          {googleNotice && <p className="mt-3 text-center text-xs text-dim">Google sign-in is not available yet.</p>}
        </div>

        <p className="mt-6 text-center text-sm text-dim">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-accent-sage-ink transition-opacity hover:opacity-80">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}