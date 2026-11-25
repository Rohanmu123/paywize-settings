/** "Tuesday, Nov 24" — the date shown beside the page title. */
export function formatToday(d: Date): string {
  const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
  const month = d.toLocaleDateString("en-US", { month: "short" });
  return `${weekday}, ${month} ${d.getDate()}`;
}

/** Indian digit grouping with ₹, two decimals: 656546.66 → "₹6,56,546.66". */
export function formatINR(amount: number, opts: { decimals?: number } = {}): string {
  const decimals = opts.decimals ?? 2;
  return "₹" + amount.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/** Masks all but the last `visible` characters: ("9876543214", 3) → "*******214". */
export function maskTail(value: string, visible = 3, mask = "*"): string {
  if (value.length <= visible) return value;
  return mask.repeat(value.length - visible) + value.slice(-visible);
}

/** Masks an Indian mobile number as "+91 ********765" (fixed 8-star mask, last 3 digits). */
export function maskMobile(mobile: string): string {
  const digits = mobile.replace(/\D/g, "");
  return `+91 ${"*".repeat(8)}${digits.slice(-3)}`;
}

/** "9845612214" → "+91 98••• ••214" (Security screen style). */
export function maskMobileDots(mobile: string): string {
  const d = mobile.replace(/\D/g, "").slice(-10);
  return `+91 ${d.slice(0, 2)}••• ••${d.slice(-3)}`;
}
