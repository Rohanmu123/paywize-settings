export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
export const isMobile = (v: string) => /^(\+?91[\s-]?)?[6-9]\d{9}$/.test(v.replace(/\s/g, ""));
export const isIPv4 = (v: string) => /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}(\/(3[0-2]|[12]?\d))?$/.test(v.trim());
export const isHttpsUrl = (v: string) => {
  try {
    return new URL(v.trim()).protocol === "https:";
  } catch {
    return false;
  }
};
export const isDomain = (v: string) => /^(?!-)([a-z0-9-]{1,63}\.)+[a-z]{2,}$/i.test(v.trim());
export const isIfsc = (v: string) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v.trim().toUpperCase());
export const isAccountNumber = (v: string) => /^\d{9,18}$/.test(v.replace(/\s/g, ""));

/** Password policy used by "Change password". */
/** Paywize rule (Security › Change password): 12+ characters, a number and a symbol. */
export function passwordIssues(pw: string): string[] {
  const issues: string[] = [];
  if (pw.length < 12) issues.push("At least 12 characters");
  if (!/\d/.test(pw)) issues.push("a number");
  if (!/[^A-Za-z0-9]/.test(pw)) issues.push("a symbol");
  return issues;
}
