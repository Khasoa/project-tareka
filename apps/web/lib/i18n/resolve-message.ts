import type { Locale } from "./types";

export interface MessageTree {
  [key: string]: string | MessageTree;
}

function followPath(tree: MessageTree, segments: string[]): string | undefined {
  let cur: string | MessageTree | undefined = tree;
  for (const s of segments) {
    if (cur === undefined || typeof cur === "string") return undefined;
    cur = cur[s];
  }
  return typeof cur === "string" ? cur : undefined;
}

/** Resolve a dotted key; falls back to English, then returns key if still missing (safe for dev). */
export function resolveMessage(
  locale: Locale,
  key: string,
  messages: Record<Locale, MessageTree>,
): string {
  const segments = key.split(".").filter(Boolean);
  const primary = followPath(messages[locale] ?? {}, segments);
  if (primary !== undefined) return primary;
  const en = followPath(messages.en ?? {}, segments);
  if (en !== undefined) return en;
  return key;
}

/** Interpolate `{{var}}` placeholders when `vars` provided. */
export function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, name: string) => String(vars[name] ?? `{{${name}}}`));
}
