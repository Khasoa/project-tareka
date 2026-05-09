import { en } from "./en";
import { sw } from "./sw";

import type { Locale } from "@/lib/i18n/types";

/** Single object for resolveMessage — only en + sw bundled (lightweight for low connectivity). */
export const messages: Record<Locale, typeof en> = {
  en,
  sw: sw as unknown as typeof en,
};
