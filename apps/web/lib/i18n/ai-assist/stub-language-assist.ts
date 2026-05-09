import type { AssistContext, LanguageAssistProvider } from "./types";

/** Offline-safe default — returns null so callers keep static `t()` strings. */
export function createStubLanguageAssist(): LanguageAssistProvider {
  return {
    id: "stub",
    async suggestClarification(_text: string, _context: AssistContext) {
      return null;
    },
    async explainInstruction(_plainInput: string, _context: AssistContext) {
      return null;
    },
  };
}
