"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { apiClient } from "@/lib/api";

import {
  companyInputCls,
  companyInputStyle,
  INDUSTRIES,
  resolveRequestError,
} from "./_shared";
import { Spinner } from "./eye-icon";
import { Field } from "./field";

interface RequestErrors {
  companyName?: string;
  contactPerson?: string;
  workEmail?: string;
  industry?: string;
}

export function CompanyRequestAccessForm() {
  const router = useRouter();
  const { t } = useI18n();

  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [industry, setIndustry] = useState("");
  const [optionalMessage, setOptionalMessage] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [requestErrors, setRequestErrors] = useState<RequestErrors>({});
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = useState(false);

  function validateRequest(): RequestErrors {
    const e: RequestErrors = {};
    if (!companyName.trim()) e.companyName = t("companyAuth.errors.companyRequired");
    if (!contactPerson.trim()) e.contactPerson = t("companyAuth.errors.contactRequired");
    if (!workEmail.trim()) e.workEmail = t("companyAuth.errors.workEmailRequired");
    if (!industry) e.industry = t("companyAuth.errors.industryRequired");
    return e;
  }

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setRequestError(null);
    const errors = validateRequest();
    if (Object.keys(errors).length) {
      setRequestErrors(errors);
      return;
    }
    setRequestErrors({});
    setRequesting(true);
    try {
      await apiClient.post("/auth/company-access-requests", {
        company_name: companyName.trim(),
        contact_person: contactPerson.trim(),
        work_email: workEmail.trim().toLowerCase(),
        industry,
        optional_message: optionalMessage.trim() || null,
      });
      setRequestSuccess(true);
    } catch (err) {
      setRequestError(resolveRequestError(err));
    } finally {
      setRequesting(false);
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

        {requestSuccess ? (
          <>
            <div
              className="rounded-3xl px-7 py-8 text-center"
              style={{ background: "#1C1C1C", border: "1px solid rgba(168,191,166,0.20)" }}
            >
              <div
                className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full text-xl"
                style={{ background: "rgba(168,191,166,0.14)", color: "#A8BFA6" }}
                aria-hidden
              >
                ✓
              </div>
              <p className="font-heading text-base font-semibold" style={{ color: "#E6E8E3" }}>
                {t("companyAuth.request.received")}
              </p>
              <p className="mt-2 text-sm text-dim">{t("companyAuth.request.receivedBody")}</p>
              <button
                type="button"
                onClick={() => router.push("/auth/company/login")}
                className="mt-6 text-sm font-medium text-accent-sage transition-opacity hover:opacity-80"
              >
                {t("companyAuth.request.backToSignIn")}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-7">
              <h1 className="font-heading text-[1.5rem] font-semibold leading-tight tracking-[-0.018em]" style={{ color: "#E6E8E3" }}>
                {t("companyAuth.request.title")}
              </h1>
              <p className="mt-1.5 text-sm text-dim">{t("companyAuth.request.subtitle")}</p>
            </div>

            <div
              className="rounded-3xl px-7 py-7"
              style={{
                background: "#1C1C1C",
                border: "1px solid rgba(232,237,234,0.08)",
                boxShadow: "0 4px 40px rgba(0,0,0,0.24)",
              }}
            >
              {requestError ? (
                <div
                  className="mb-5 rounded-xl px-4 py-3 text-sm"
                  style={{
                    background: "rgba(180,90,90,0.10)",
                    border: "1px solid rgba(180,90,90,0.22)",
                    color: "#c48080",
                  }}
                >
                  {requestError}
                </div>
              ) : null}

              <form onSubmit={handleRequest} noValidate className="space-y-4">
                <Field label={t("companyAuth.fields.companyName")} error={requestErrors.companyName}>
                  <input
                    type="text"
                    placeholder="Nairobi Recyclers Ltd"
                    value={companyName}
                    onChange={(e) => {
                      setCompanyName(e.target.value);
                      if (requestErrors.companyName) setRequestErrors((p) => ({ ...p, companyName: undefined }));
                    }}
                    className={cn(
                      companyInputCls,
                      requestErrors.companyName ? "ring-1 ring-[rgba(180,90,90,0.5)]" : "focus:ring-[rgba(168,191,166,0.36)]",
                    )}
                    style={companyInputStyle}
                  />
                </Field>

                <Field label={t("companyAuth.fields.contactPerson")} error={requestErrors.contactPerson}>
                  <input
                    type="text"
                    placeholder={t("companyAuth.placeholders.fullName")}
                    value={contactPerson}
                    onChange={(e) => {
                      setContactPerson(e.target.value);
                      if (requestErrors.contactPerson) setRequestErrors((p) => ({ ...p, contactPerson: undefined }));
                    }}
                    className={cn(
                      companyInputCls,
                      requestErrors.contactPerson ? "ring-1 ring-[rgba(180,90,90,0.5)]" : "focus:ring-[rgba(168,191,166,0.36)]",
                    )}
                    style={companyInputStyle}
                  />
                </Field>

                <Field label={t("companyAuth.fields.workEmail")} error={requestErrors.workEmail}>
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={workEmail}
                    onChange={(e) => {
                      setWorkEmail(e.target.value);
                      if (requestErrors.workEmail) setRequestErrors((p) => ({ ...p, workEmail: undefined }));
                    }}
                    className={cn(
                      companyInputCls,
                      requestErrors.workEmail ? "ring-1 ring-[rgba(180,90,90,0.5)]" : "focus:ring-[rgba(168,191,166,0.36)]",
                    )}
                    style={companyInputStyle}
                  />
                </Field>

                <Field label={t("companyAuth.fields.industry")} error={requestErrors.industry}>
                  <select
                    value={industry}
                    onChange={(e) => {
                      setIndustry(e.target.value);
                      if (requestErrors.industry) setRequestErrors((p) => ({ ...p, industry: undefined }));
                    }}
                    className={cn(
                      companyInputCls,
                      requestErrors.industry ? "ring-1 ring-[rgba(180,90,90,0.5)]" : "focus:ring-[rgba(168,191,166,0.36)]",
                    )}
                    style={{ ...companyInputStyle, appearance: "none" }}
                  >
                    <option value="" style={{ background: "#232323" }}>
                      {t("companyAuth.placeholders.selectIndustry")}
                    </option>
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind} style={{ background: "#232323" }}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label={t("companyAuth.fields.optionalMessage")}>
                  <textarea
                    rows={3}
                    placeholder={t("companyAuth.placeholders.message")}
                    value={optionalMessage}
                    onChange={(e) => setOptionalMessage(e.target.value)}
                    className={cn(companyInputCls, "resize-none focus:ring-[rgba(168,191,166,0.36)]")}
                    style={companyInputStyle}
                  />
                </Field>

                <button
                  type="submit"
                  disabled={requesting}
                  className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-55"
                  style={{ background: "#A8BFA6", color: "#161615" }}
                  onMouseEnter={(e) => {
                    if (!requesting) e.currentTarget.style.background = "#B7C9B5";
                  }}
                  onMouseLeave={(e) => {
                    if (!requesting) e.currentTarget.style.background = "#A8BFA6";
                  }}
                >
                  {requesting ? (
                    <>
                      <Spinner />
                      {t("companyAuth.request.sending")}
                    </>
                  ) : (
                    t("companyAuth.request.submit")
                  )}
                </button>
              </form>
            </div>

            <p className="mt-6 text-center text-sm text-dim">
              {t("companyAuth.request.signInPrompt")}{" "}
              <Link href="/auth/company/login" className="font-medium text-accent-sage transition-opacity hover:opacity-80">
                {t("nav.signIn")}
              </Link>
            </p>
          </>
        )}

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
