"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { messages } from "@/messages/bundle";
import { useAuthStore } from "@/store/auth";

import { interpolate, resolveMessage, type MessageTree } from "./resolve-message";
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, type Locale } from "./types";

export type I18nContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const userLanguage = useAuthStore((s) => s.user?.language);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (raw === "sw" || raw === "en") {
        setLocaleState(raw);
        return;
      }
    } catch {
      /* private mode / quota */
    }
    if (userLanguage === "sw" || userLanguage === "en") {
      setLocaleState(userLanguage as Locale);
    }
  }, [userLanguage]);

  useEffect(() => {
    document.documentElement.lang = locale === "sw" ? "sw" : "en";
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = next === "sw" ? "sw" : "en";
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const raw = resolveMessage(locale, key, messages as Record<Locale, MessageTree>);
      return interpolate(raw, vars);
    },
    [locale],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, setLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}
