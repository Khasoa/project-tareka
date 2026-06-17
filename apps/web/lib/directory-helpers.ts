/** Shared for directory cards and site profile material chips. */
export function inferMaterialsFromDescription(description: string | null | undefined): string[] {
  const d = (description ?? "").toLowerCase();
  const out: string[] = [];
  if (d.includes("plastic")) out.push("plastic");
  if (d.includes("glass")) out.push("glass");
  if (d.includes("paper") || d.includes("cardboard")) out.push("paper");
  if (d.includes("metal") || d.includes("can")) out.push("metal");
  if (d.includes("e-waste") || d.includes("electronic") || d.includes("ewaste")) out.push("ewaste");
  if (out.length === 0) return ["plastic", "paper"];
  return [...new Set(out)];
}

export function materialChipLabel(m: string): string {
  return m.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
