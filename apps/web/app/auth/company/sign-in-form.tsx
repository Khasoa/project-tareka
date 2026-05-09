"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { type LoginPayload } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth";

import {
  companyInputCls,
  companyInputStyle,
  resolveLoginError,
  roleRoute,
} from "./_shared";
import { EyeIcon, Spinner } from "./eye-icon";
import { Field } from "./field";

interface SigninErrors {
  email?: string;
  password?: string;
}

export function CompanySignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const { t } = useI18n();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [signinErrors, setSigninErrors] = useState<SigninErrors>({});
  const [signinError, setSigninError] = useState<string | null>(null);

  function validateSignin(): SigninErrors {
    const e: SigninErrors = {};
    if (!email.trim()) e.email = t("companyAuth.errors.workEmailRequired");
    if (!password) e.password = t("companyAuth.errors.passwordRequired");
    else if (password.length < 8) e.password = t("companyAuth.errors.passwordShort");
    return e;
  }

  async function handleSignin(e: React.FormEvent) {
    e.preventDefault();
    setSigninError(null);
    const errors = validateSignin();
    if (Object.keys(errors).length) {
      setSigninErrors(errors);
      return;
    }
    setSigninErrors({});
    setSigningIn(true);
    try {
      const payload: LoginPayload = { email: email.trim().toLowerCase(), password };
      await login(payload);
      const user = useAuthStore.getState().user;
      const fallback = roleRoute(user!.role);
      const next = searchParams.get("redirect");
      router.push(next && next.startsWith("/") ? next : fallback);
    } catch (err) {
      setSigninError(resolveLoginError(err));
    } finally {
      setSigningIn(false);
    }
  }

  return (
    <div
      className="dark flex min-h-screen flex-col items-center justify-center px-5 py-14"
      style={{ background: "#161615" }}
    >
      <div className="w-full max-w-[420px]">
        <div className="mb-9 flex items-center gap-5">
          <Link
            href="/for-companies"
            className="group inline-flex shrink-0 items-center gap-1.5 rounded text-xs text-[#72776f] transition-colors hover:text-[#A8BFA6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(168,191,166,0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#161615]"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 opacity-75 transition-[transform,opacity] group-hover:-translate-x-0.5 group-hover:opacity-100" aria-hidden>
              <path d="M9.5 3.5 5 8l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{t("companyAuth.backToOverview")}</span>
          </Link>
          <Logo href="/for-companies" className="text-xl" variant="chrome" />
        </div>

        <div className="mb-7">
          <h1
            className="font-heading text-[1.5rem] font-semibold leading-tight tracking-[-0.018em]"
            style={{ color: "#E6E8E3" }}
          >
            {t("companyAuth.signIn.title")}
          </h1>
          <p className="mt-1.5 text-sm text-dim">{t("companyAuth.signIn.subtitle")}</p>
        </div>

        <div
          className="rounded-3xl px-7 py-7"
          style={{
            background: "#1C1C1C",
            border: "1px solid rgba(232,237,234,0.08)",
            boxShadow: "0 4px 40px rgba(0,0,0,0.24)",
          }}
        >
          {signinError ? (
            <div
              className="mb-5 rounded-xl px-4 py-3 text-sm"
              style={{ background: "rgba(180,90,90,0.10)", border: "1px solid rgba(180,90,90,0.22)", color: "#c48080" }}
            >
              {signinError}
            </div>
          ) : null}

          <form onSubmit={handleSignin} noValidate className="space-y-4">
            <Field label={t("companyAuth.fields.workEmail")} error={signinErrors.email}>
              <input
                type="email"
                autoComplete="username"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (signinErrors.email) setSigninErrors((p) => ({ ...p, email: undefined }));
                }}
                className={cn(
                  companyInputCls,
                  signinErrors.email ? "ring-1 ring-[rgba(180,90,90,0.5)]" : "focus:ring-[rgba(168,191,166,0.36)]",
                )}
                style={companyInputStyle}
              />
            </Field>

            <Field label={t("companyAuth.fields.password")} error={signinErrors.password}>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (signinErrors.password) setSigninErrors((p) => ({ ...p, password: undefined }));
                  }}
                  className={cn(
                    companyInputCls,
                    "pr-10",
                    signinErrors.password ? "ring-1 ring-[rgba(180,90,90,0.5)]" : "focus:ring-[rgba(168,191,166,0.36)]",
                  )}
                  style={companyInputStyle}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide" : "Show"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-dim transition-opacity hover:opacity-80"
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </Field>

            <button
              type="submit"
              disabled={signingIn}
              className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-55"
              style={{ background: "#A8BFA6", color: "#161615" }}
              onMouseEnter={(e) => {
                if (!signingIn) e.currentTarget.style.background = "#B7C9B5";
              }}
              onMouseLeave={(e) => {
                if (!signingIn) e.currentTarget.style.background = "#A8BFA6";
              }}
            >
              {signingIn ? (
                <>
                  <Spinner />
                  {t("companyAuth.signIn.submitting")}
                </>
              ) : (
                t("companyAuth.signIn.submit")
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-dim">
          {t("companyAuth.signIn.footerPrompt")}{" "}
          <Link href="/auth/company/request" className="font-medium text-accent-sage transition-opacity hover:opacity-80">
            {t("companyAuth.links.requestAccess")}
          </Link>
        </p>

        <p className="mt-8 text-center text-xs text-dim">
          {t("companyAuth.signIn.recyclerPrompt")}{" "}
          <Link href="/auth/login" className="text-accent-sage transition-opacity hover:opacity-80">
            {t("companyAuth.links.recyclerSignIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}
