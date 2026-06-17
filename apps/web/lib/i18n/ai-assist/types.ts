/**
 * Future Llama-compatible (or similar) language assistance — no runtime shipped here.
 * Implement `LanguageAssistProvider` when onboarding guidance or conversational Swahili is added.
 */

import type { Locale } from "../types";

export type AssistContext = {
  locale: Locale;
  topic?: string;
};

/** Optional async helpers; all no-ops in the default stub. */
export interface LanguageAssistProvider {
  readonly id: string;
  /** Lightweight rewrite for help copy (never replace static UI bundles as primary source). */
  suggestClarification?(text: string, context: AssistContext): Promise<string | null>;
  /** Future: explain recycling instructions in `context.locale`. */
  explainInstruction?(plainInput: string, context: AssistContext): Promise<string | null>;
}
