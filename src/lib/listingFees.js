/** Pure helpers for the Listing Fees admin page (no React, easy to test). */

export const GST_RATE = 18;

export const withGst = (base) => {
  const b = Math.max(0, Math.round(Number(base) || 0));
  const gst = Math.round((b * GST_RATE) / 100);
  return { base: b, gst, total: b + gst };
};

/** { [propertyCategory]: "500" } for the "Any" rules (the page manages one fee per property type) */
export const amountsFromRules = (rules = []) =>
  Object.fromEntries(rules.filter((r) => r.listing_type === "Any").map((r) => [r.property_category, String(r.amount)]));

/**
 * What to send to the server so the saved rules match what the admin typed.
 * A blank box removes the rule (the property type then uses the default fee).
 * Returns { save: [{ property_category, amount }], remove: [ruleId], invalid: [category] }.
 */
export function diffFees(rules = [], amounts = {}) {
  const existing = new Map(rules.filter((r) => r.listing_type === "Any").map((r) => [r.property_category, r]));
  const save = [];
  const remove = [];
  const invalid = [];
  for (const [category, raw] of Object.entries(amounts)) {
    const text = String(raw ?? "").trim();
    const current = existing.get(category);
    if (text === "") {
      if (current) remove.push(current.id);
      continue;
    }
    const n = Number(text);
    if (!Number.isInteger(n) || n < 0 || n > 1_000_000) {
      invalid.push(category);
      continue;
    }
    if (!current || Number(current.amount) !== n) save.push({ property_category: category, amount: n });
  }
  return { save, remove, invalid };
}
