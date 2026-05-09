"use client";

import { useMemo } from "react";

import { getLanguageAssistProvider } from "./registry";
import type { LanguageAssistProvider } from "./types";

import { useI18n } from "@/lib/i18n/i18n-provider";

/** Safe hook for future AI-assisted explanations; currently returns stub only. */
export function useLanguageAssist(): {
  assist: LanguageAssistProvider;
  localeMatchesUi: boolean;
} {
  const { locale } = useI18n();
  return useMemo(
    () => ({
      assist: getLanguageAssistProvider(),
      localeMatchesUi: true,
    }),
    [locale],
  );
}
