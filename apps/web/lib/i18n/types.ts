/** BCP-47 style; expand with e.g. `lg` without breaking consumers. */
export type Locale = "en" | "sw";

export const SUPPORTED_LOCALES: readonly Locale[] = ["en", "sw"] as const;

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_STORAGE_KEY = "tareka-locale";
