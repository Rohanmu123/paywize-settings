import { ALERT_SECTIONS, RECIPIENTS, SUMMARIES, type AlertGroup, type Channel, type Recipient } from "@/data/alerts";
import { createStore } from "@/lib/store";
import { isEmail } from "@/lib/validation";
import { delay } from "./delay";

export const alertsStore = createStore({ recipients: RECIPIENTS, sections: ALERT_SECTIONS, summaries: SUMMARIES });

export function validateRecipientEmail(email: string, ignoreId?: string): string | null {
  if (!email.trim()) return "Enter an email address";
  if (!isEmail(email)) return "Enter a valid email address";
  if (alertsStore.get().recipients.some((r) => r.email.toLowerCase() === email.trim().toLowerCase() && r.id !== ignoreId)) return "This address already gets alerts";
  return null;
}

export async function addRecipient(input: { name: string; email: string; group: AlertGroup }) {
  await delay();
  const r: Recipient = { id: `r${Date.now()}`, name: input.name.trim(), email: input.email.trim().toLowerCase(), group: input.group, status: "awaiting" };
  alertsStore.set((s) => ({ ...s, recipients: [...s.recipients, r] }));
}

export async function updateRecipient(id: string, patch: Partial<Pick<Recipient, "name" | "group">>) {
  await delay();
  alertsStore.set((s) => ({ ...s, recipients: s.recipients.map((r) => (r.id === id ? { ...r, ...patch } : r)) }));
}

/** Saving a corrected address sends a fresh consent mail. */
export async function fixRecipientEmail(id: string, email: string) {
  await delay();
  alertsStore.set((s) => ({ ...s, recipients: s.recipients.map((r) => (r.id === id ? { ...r, email: email.trim().toLowerCase(), status: "awaiting" } : r)) }));
}

export async function resendConsent() {
  await delay();
}

export async function setChannel(eventId: string, channel: Channel, on: boolean) {
  await delay(150);
  alertsStore.set((s) => ({
    ...s,
    sections: s.sections.map((sec) => ({ ...sec, events: sec.events.map((e) => (e.id === eventId && !e.locked?.includes(channel) ? { ...e, channels: { ...e.channels, [channel]: on } } : e)) })),
  }));
}

export async function setSummary(id: string, on: boolean) {
  await delay();
  alertsStore.set((s) => ({ ...s, summaries: s.summaries.map((x) => (x.id === id ? { ...x, on } : x)) }));
}
