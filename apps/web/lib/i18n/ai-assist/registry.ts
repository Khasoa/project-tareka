import { createStubLanguageAssist } from "./stub-language-assist";
import type { LanguageAssistProvider } from "./types";

let cached: LanguageAssistProvider | null = null;

/**
 * Single registry hook for future Llama-compatible providers.
 * Set `NEXT_PUBLIC_TAREKA_AI_ASSIST=1` only when a real provider is wired — until then, stub only.
 */
export function getLanguageAssistProvider(): LanguageAssistProvider {
  if (cached) return cached;
  const flag = process.env.NEXT_PUBLIC_TAREKA_AI_ASSIST;
  if (flag === "1") {
    // Future: return createLlamaCompatibleAssist() from a lazy-loaded module.
    cached = createStubLanguageAssist();
    return cached;
  }
  cached = createStubLanguageAssist();
  return cached;
}

export function resetLanguageAssistProviderForTests(): void {
  cached = null;
}
