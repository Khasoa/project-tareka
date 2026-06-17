/** Maps canonical API reward_model hints to concise display copy (no speculative framing). */

export function formatRewardModels(models: readonly string[]): string {
  const labels = [...new Set(models.map((m) => labelForRewardModelTag(m.trim().toLowerCase())))];
  return labels.join(" · ");
}

function labelForRewardModelTag(model: string): string {
  switch (model) {
    case "redeemable_offer":
      return "Redeemable with tokens";
    case "partner_discount":
      return "Partner discount pathway";
    case "sats_partner_program":
      return "Bitcoin sats (partner)";
    default:
      return model.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
