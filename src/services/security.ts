import { initialSecurity, type SecurityState } from "@/data/security";
import { createStore } from "@/lib/store";
import { isEmail, isMobile, passwordIssues } from "@/lib/validation";
import { delay } from "./delay";

export const securityStore = createStore<SecurityState>(initialSecurity);

export type PasswordForm = { current: string; next: string; confirm: string };

export function validatePasswordChange(f: PasswordForm): Partial<Record<keyof PasswordForm, string>> {
  const e: Partial<Record<keyof PasswordForm, string>> = {};
  if (!f.current) e.current = "Enter your current password";
  const issues = passwordIssues(f.next);
  if (!f.next) e.next = "Enter a new password";
  else if (issues.length) e.next = `Needs ${issues.join(", ").replace(/^At least/, "at least")}`;
  else if (f.next === f.current) e.next = "Use a password you have not used before";
  if (f.confirm !== f.next) e.confirm = "Passwords do not match";
  return e;
}

export async function changePassword() {
  await delay();
  securityStore.set((s) => ({ ...s, passwordChanged: "just now" }));
}

export function normaliseMobile(v: string) {
  return v.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
}

export async function changeMobile(v: string) {
  if (!isMobile(v)) throw new Error("Enter a valid 10-digit mobile number");
  await delay();
  securityStore.set((s) => ({ ...s, mobile: normaliseMobile(v) }));
}

export async function enableEmailCode(email: string) {
  if (!isEmail(email)) throw new Error("Enter a valid email");
  await delay();
  securityStore.set((s) => ({ ...s, email: email.trim(), emailCodeEnabled: true }));
}

export async function setRequireForEveryone(on: boolean) {
  await delay();
  securityStore.set((s) => ({ ...s, requireForEveryone: on }));
}

export async function setSensitiveAction(id: string, on: boolean) {
  await delay();
  securityStore.set((s) => ({ ...s, actions: s.actions.map((a) => (a.id === id && !a.alwaysOn ? { ...a, on } : a)) }));
}
