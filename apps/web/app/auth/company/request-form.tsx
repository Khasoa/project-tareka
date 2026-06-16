"use client";

import Link from "next/link";
import { useState } from "react";

import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { apiClient } from "@/lib/api";

import {
  companyInputCls,
  companyInputStyle,
  INDUSTRIES,
  normalizePhoneInput,
  resolveRequestError,
} from "./_shared";
import { Spinner } from "./eye-icon";
import { Field } from "./field";

interface RequestErrors {
  companyName?: string;
  contactPerson?: string;
  workEmail?: string;
  phone?: string;
  companyType?: string;
  countyLocation?: string;
  materialsHandled?: string;
}

function digitsLen(normalizedPhone: string): number {
  return normalizedPhone.replace(/\D/g, "").length;
}

export function CompanyRequestAccessForm() {
  const { t } = useI18n();

  const [companyName, setCompanyName]             = useState("");
  const [contactPerson, setContactPerson]         = useState("");
  const [workEmail, setWorkEmail]                 = useState("");
  const [phone, setPhone]                         = useState("");
  const [companyType, setCompanyType]             = useState("");
  const [countyLocation, setCountyLocation]       = useState("");
  const [materialsHandled, setMaterialsHandled]   = useState("");
  const [optionalMessage, setOptionalMessage]     = useState("");
  const [requesting, setRequesting]               = useState(false);
  const [requestErrors, setRequestErrors]         = useState<RequestErrors>({});
  const [requestError, setRequestError]           = useState<string | null>(null);
  const [requestSuccess, setRequestSuccess]       = useState(false);

  function validateRequest(): RequestErrors {
    const e: RequestErrors = {};
    if (!companyName.trim()) e.companyName = t("companyAuth.errors.companyRequired");
    if (!contactPerson.trim()) e.contactPerson = t("companyAuth.errors.contactRequired");
    if (!workEmail.trim()) e.workEmail = t("companyAuth.errors.workEmailRequired");
    if (!phone.trim()) e.phone = t("companyAuth.errors.phoneRequired");
    else {
      const pn = normalizePhoneInput(phone);
      if (digitsLen(pn) < 7 || digitsLen(pn) > 15) e.phone = t("companyAuth.errors.invalidPhone");
    }
    if (!companyType) e.companyType = t("companyAuth.errors.industryRequired");
    if (!countyLocation.trim()) e.countyLocation = t("companyAuth.errors.countyRequired");
    if (!materialsHandled.trim()) e.materialsHandled = t("companyAuth.errors.materialsRequired");
    return e;
  }

  async function handleRequest(ev: React.FormEvent) {
    ev.preventDefault();
    setRequestError(null);
    const errors = validateRequest();
    if (Object.keys(errors).length) { setRequestErrors(errors); return; }
    setRequestErrors({});
    setRequesting(true);
    try {
      await apiClient.post("/auth/company-access-requests", {
        company_name:     companyName.trim(),
        contact_person:   contactPerson.trim(),
        work_email:       workEmail.trim().toLowerCase(),
        phone:            normalizePhoneInput(phone),
        company_type:     companyType,
        county_location:  countyLocation.trim(),
        materials_handled: materialsHandled.trim(),
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
    <div className="dark flex min-h-screen flex-col items-center justify-center px-5 py-14 bg-background">
      <div className="w-full max-w-[420px]">
        {/* Top bar */}
        <div className="mb-9 flex items-center gap-5">
          <Link
            href="/for-companies"
            className="group inline-flex shrink-0 items-center gap-1.5 rounded text-xs text-dim transition-colors hover:text-nav-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 opacity-75 transition-[transform,opacity] group-hover:-translate-x-0.5 group-hover:opacity-100" aria-hidden>
              <path d="M9.5 3.5 5 8l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{t("companyAuth.backToOverview")}</span>
          </Link>
          <Logo href="/" className="text-xl" variant="chrome" />
        </div>

        {requestSuccess ? (
          <div className="rounded-3xl px-7 py-8 text-center"
            style={{ background: "#1C1C1C", border: "1px solid rgba(161,201,152,0.20)" }}>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full text-xl"
              style={{ background: "rgba(161,201,152,0.14)", color: "#A1C998" }} aria-hidden>
              ✓
            </div>
            <p className="font-heading text-base font-semibold text-foreground">
              {t("companyAuth.request.received")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-dim">
              {t("companyAuth.request.receivedBody")}
            </p>
            <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.12em] text-dim">
              {t("companyAuth.request.demoPasswordLabel")}
            </p>
            <p className="mt-2 rounded-xl border border-[rgba(232,237,234,0.12)] bg-[#232323] px-4 py-3 font-mono text-sm tracking-wide text-foreground"
              style={{ letterSpacing: "0.06em" }}>
              12345678
            </p>
            <p className="mt-4 text-[11px] leading-snug text-dim/85">
              {t("companyAuth.request.demoPasswordWarning")}
            </p>
            <p className="mt-6 text-xs text-dim">
              {t("companyAuth.request.invitedHint")}{" "}
              <Link href="/company/login" className="font-medium text-accent-sage-ink transition-opacity hover:opacity-80">
                {t("nav.companyLogin")}
              </Link>
            </p>
          </div>
        ) : (
          <>
            <div className="mb-7">
              <h1 className="font-heading text-[1.5rem] font-semibold leading-tight tracking-[-0.018em] text-foreground">
                {t("companyAuth.request.title")}
              </h1>
              <p className="mt-1.5 text-sm text-dim">{t("companyAuth.request.subtitle")}</p>
            </div>

            <div className="rounded-3xl px-7 py-7"
              style={{
                background: "#1C1C1C",
                border: "1px solid rgba(232,237,234,0.08)",
                boxShadow: "0 4px 40px rgba(0,0,0,0.24)",
              }}
            >
              {requestError && (
                <div className="mb-5 rounded-xl px-4 py-3 text-sm"
                  style={{ background: "rgba(180,90,90,0.10)", border: "1px solid rgba(180,90,90,0.22)", color: "#c48080" }}>
                  {requestError}
                </div>
              )}

              <form onSubmit={handleRequest} noValidate className="space-y-4">
                <Field label={t("companyAuth.fields.companyName")} error={requestErrors.companyName}>
                  <input type="text" placeholder="Nairobi Recyclers Ltd"
                    value={companyName}
                    onChange={(e) => { setCompanyName(e.target.value); if (requestErrors.companyName) setRequestErrors((p) => ({ ...p, companyName: undefined })); }}
                    className={cn(companyInputCls, requestErrors.companyName ? "ring-1 ring-[rgba(180,90,90,0.5)]" : "focus:ring-[rgba(161,201,152,0.36)]")}
                    style={companyInputStyle}
                  />
                </Field>

                <Field label={t("companyAuth.fields.contactPerson")} error={requestErrors.contactPerson}>
                  <input type="text" placeholder={t("companyAuth.placeholders.fullName")}
                    value={contactPerson}
                    onChange={(e) => { setContactPerson(e.target.value); if (requestErrors.contactPerson) setRequestErrors((p) => ({ ...p, contactPerson: undefined })); }}
                    className={cn(companyInputCls, requestErrors.contactPerson ? "ring-1 ring-[rgba(180,90,90,0.5)]" : "focus:ring-[rgba(161,201,152,0.36)]")}
                    style={companyInputStyle}
                  />
                </Field>

                <Field label={t("companyAuth.fields.workEmail")} error={requestErrors.workEmail}>
                  <input type="email" placeholder="you@company.com"
                    value={workEmail}
                    onChange={(e) => { setWorkEmail(e.target.value); if (requestErrors.workEmail) setRequestErrors((p) => ({ ...p, workEmail: undefined })); }}
                    className={cn(companyInputCls, requestErrors.workEmail ? "ring-1 ring-[rgba(180,90,90,0.5)]" : "focus:ring-[rgba(161,201,152,0.36)]")}
                    style={companyInputStyle}
                  />
                </Field>

                <Field label={t("companyAuth.fields.phone")} error={requestErrors.phone}>
                  <input type="tel" placeholder={t("companyAuth.placeholders.phone")}
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); if (requestErrors.phone) setRequestErrors((p) => ({ ...p, phone: undefined })); }}
                    className={cn(companyInputCls, requestErrors.phone ? "ring-1 ring-[rgba(180,90,90,0.5)]" : "focus:ring-[rgba(161,201,152,0.36)]")}
                    style={companyInputStyle}
                  />
                </Field>

                <Field label={t("companyAuth.fields.companyType")} error={requestErrors.companyType}>
                  <select value={companyType}
                    onChange={(e) => { setCompanyType(e.target.value); if (requestErrors.companyType) setRequestErrors((p) => ({ ...p, companyType: undefined })); }}
                    className={cn(companyInputCls, requestErrors.companyType ? "ring-1 ring-[rgba(180,90,90,0.5)]" : "focus:ring-[rgba(161,201,152,0.36)]")}
                    style={{ ...companyInputStyle, appearance: "none" }}
                  >
                    <option value="" style={{ background: "#232323" }}>{t("companyAuth.placeholders.selectIndustry")}</option>
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind} style={{ background: "#232323" }}>{ind}</option>
                    ))}
                  </select>
                </Field>

                <Field label={t("companyAuth.fields.countyLocation")} error={requestErrors.countyLocation}>
                  <input type="text" placeholder={t("companyAuth.placeholders.county")}
                    value={countyLocation}
                    onChange={(e) => { setCountyLocation(e.target.value); if (requestErrors.countyLocation) setRequestErrors((p) => ({ ...p, countyLocation: undefined })); }}
                    className={cn(companyInputCls, requestErrors.countyLocation ? "ring-1 ring-[rgba(180,90,90,0.5)]" : "focus:ring-[rgba(161,201,152,0.36)]")}
                    style={companyInputStyle}
                  />
                </Field>

                <Field label={t("companyAuth.fields.materialsHandled")} error={requestErrors.materialsHandled}>
                  <textarea rows={3} placeholder={t("companyAuth.placeholders.materials")}
                    value={materialsHandled}
                    onChange={(e) => { setMaterialsHandled(e.target.value); if (requestErrors.materialsHandled) setRequestErrors((p) => ({ ...p, materialsHandled: undefined })); }}
                    className={cn(companyInputCls, "resize-none focus:ring-[rgba(161,201,152,0.36)]")}
                    style={companyInputStyle}
                  />
                </Field>

                <Field label={t("companyAuth.fields.shortMessage")}>
                  <textarea rows={3} placeholder={t("companyAuth.placeholders.message")}
                    value={optionalMessage}
                    onChange={(e) => setOptionalMessage(e.target.value)}
                    className={cn(companyInputCls, "resize-none focus:ring-[rgba(161,201,152,0.36)]")}
                    style={companyInputStyle}
                  />
                </Field>

                <button type="submit" disabled={requesting}
                  className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-55"
                  style={{ background: "#A1C998", color: "#161615" }}
                  onMouseEnter={(e) => { if (!requesting) e.currentTarget.style.background = "#B0D4A8"; }}
                  onMouseLeave={(e) => { if (!requesting) e.currentTarget.style.background = "#A1C998"; }}
                >
                  {requesting ? <><Spinner />{t("companyAuth.request.sending")}</> : t("companyAuth.request.submit")}
                </button>
              </form>
            </div>

            <p className="mt-6 text-center text-sm text-dim">
              {t("companyAuth.request.signInPrompt")}{" "}
              <Link href="/company/login" className="font-medium text-accent-sage-ink transition-opacity hover:opacity-80">
                {t("nav.companyLogin")}
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}