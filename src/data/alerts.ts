export const ALERT_GROUPS = ["Everything", "Settlements and payouts", "Settlements, invoices", "Payments and refunds", "Security, webhooks"] as const;
export type AlertGroup = (typeof ALERT_GROUPS)[number];

export type RecipientStatus = "confirmed" | "awaiting" | "bounced";
export type Recipient = { id: string; name: string; email: string; group: AlertGroup; status: RecipientStatus };

export const RECIPIENT_STATUS: Record<RecipientStatus, { label: string; tone: "success" | "warning" | "error" }> = {
  confirmed: { label: "Confirmed", tone: "success" },
  awaiting: { label: "Awaiting confirmation", tone: "warning" },
  bounced: { label: "Bounced", tone: "error" },
};

export const RECIPIENTS: Recipient[] = [
  { id: "r1", name: "Accounts team", email: "accounts@sharmatextiles.in", group: "Everything", status: "confirmed" },
  { id: "r2", name: "Finance team", email: "finance@sharmatextiles.in", group: "Settlements, invoices", status: "awaiting" },
  { id: "r3", name: "IT team", email: "it@sharmatextiles.in", group: "Security, webhooks", status: "bounced" },
];

export const CHANNELS = ["email", "sms", "whatsapp", "inApp"] as const;
export type Channel = (typeof CHANNELS)[number];
export const CHANNEL_LABEL: Record<Channel, string> = { email: "Email", sms: "SMS", whatsapp: "WhatsApp", inApp: "In-app" };

export type AlertEvent = { id: string; label: string; channels: Record<Channel, boolean>; locked?: Channel[] };
export type AlertSection = { title: string; events: AlertEvent[] };

const ch = (email: boolean, sms: boolean, whatsapp: boolean, inApp: boolean) => ({ email, sms, whatsapp, inApp });
/** Security alerts always go to the owner by email, SMS and in-app; only WhatsApp is optional. */
const SECURITY_LOCK: Channel[] = ["email", "sms", "inApp"];

export const ALERT_SECTIONS: AlertSection[] = [
  {
    title: "Payments",
    events: [
      { id: "failure-rate", label: "Failure rate above 10%", channels: ch(true, false, false, true) },
      { id: "chargeback", label: "Chargeback received", channels: ch(true, true, false, true) },
      { id: "large-payment", label: "Payment over ₹2,00,000", channels: ch(true, false, false, true) },
    ],
  },
  {
    title: "Settlements",
    events: [
      { id: "settlement-processed", label: "Settlement processed", channels: ch(true, false, true, true) },
      { id: "settlement-hold", label: "Settlement on hold", channels: ch(true, true, true, true) },
      { id: "settlement-failed", label: "Settlement failed", channels: ch(true, true, true, true) },
    ],
  },
  {
    title: "Security",
    events: [
      { id: "new-login", label: "New login or device", channels: ch(false, false, false, false), locked: SECURITY_LOCK },
      { id: "api-key", label: "API key regenerated", channels: ch(false, false, false, false), locked: SECURITY_LOCK },
      { id: "bank-change", label: "Bank account change requested", channels: ch(false, false, false, false), locked: SECURITY_LOCK },
    ],
  },
  {
    title: "Service health",
    events: [
      { id: "webhook-failing", label: "Webhook endpoint failing", channels: ch(true, false, false, true) },
      { id: "downtime", label: "Gateway downtime", channels: ch(true, true, false, true) },
    ],
  },
];

export const SUMMARIES = [
  { id: "daily", title: "Daily settlement summary", hint: "Every morning at 9:00 AM IST", on: true },
  { id: "weekly", title: "Weekly business summary", hint: "Mondays, volume, success rate and refunds", on: false },
];
