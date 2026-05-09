"use client";

import Image from "next/image";

import { useI18n } from "@/lib/i18n/i18n-provider";

const FORM_SURFACE = "#121212";

/** Client wrapper so illustration caption respects locale — panel is purely decorative apart from caption. */
function IllustrationCaption() {
  const { t } = useI18n();
  return (
    <div className="mt-7 max-w-[17.5rem] text-center sm:max-w-xs">
      <p className="text-sm leading-relaxed text-[#9a9f96]">{t("auth.illustrationCaption")}</p>
    </div>
  );
}

export function AuthIllustrationPanel() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-[#111111] py-10 px-8 sm:px-10 lg:w-1/2 lg:min-h-screen lg:py-16 lg:px-12 xl:px-14">
      <div
        className="pointer-events-none absolute -left-20 top-[18%] h-72 w-72 rounded-full opacity-[0.35] blur-[88px]"
        style={{
          background: "radial-gradient(circle, rgba(143,178,174,0.22) 0%, transparent 70%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-[8%] top-[8%] h-56 w-56 rounded-full opacity-25 blur-[72px]"
        style={{
          background: "radial-gradient(circle, rgba(230,232,227,0.06) 0%, transparent 68%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/3 bottom-[12%] h-48 w-48 rounded-full opacity-[0.2] blur-[64px]"
        style={{
          background: "radial-gradient(circle, rgba(184,160,138,0.12) 0%, transparent 65%)",
        }}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-[1] hidden w-[min(38%,14rem)] lg:block"
        style={{
          background: `linear-gradient(to right, transparent, ${FORM_SURFACE})`,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-28 lg:hidden"
        style={{
          background: `linear-gradient(to bottom, transparent, ${FORM_SURFACE})`,
        }}
        aria-hidden
      />

      <div className="relative z-0 flex w-full max-w-[min(100%,24rem)] flex-col items-center sm:max-w-[min(100%,28rem)] lg:max-w-[min(100%,34rem)]">
        <Image
          src="/images/auth-illustration.png"
          alt=""
          width={640}
          height={520}
          className="h-auto w-full object-contain"
          sizes="(max-width: 1024px) 90vw, 400px"
          style={{
            maxHeight: "min(56vh, 380px)",
            filter: "drop-shadow(0 16px 48px rgba(0,0,0,0.28))",
          }}
          priority
        />
        <IllustrationCaption />
      </div>
    </div>
  );
}
