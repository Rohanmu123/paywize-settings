export type KeyMode = "live" | "test";

export type ApiKey = {
  id: string;
  name: string;
  mode: KeyMode;
  createdAt: string;
  createdBy: string;
  lastUsed: string;
  /** Minutes until an old key stops working after a regenerate. */
  expiresInMinutes?: number;
  regeneratedOn?: string;
  /** Servers that called with this key in the last 24 hours. */
  servers: number;
  calls: { at: string; request: string; result: string }[];
};

export type AllowedIp = { ip: string; label: string; addedBy: string };

export const KEY_ROLES = [
  { label: "Owner", tone: "brand" },
  { label: "Admin", tone: "info" },
  { label: "Developer", tone: "warning" },
] as const;

const CALLS = [
  { at: "23 Nov, 11:20 AM", request: "POST /v1/orders", result: "200 OK" },
  { at: "23 Nov, 11:02 AM", request: "GET /v1/payments", result: "200 OK" },
  { at: "22 Nov, 06:41 PM", request: "POST /v1/refunds", result: "401 Expired" },
];

export const API_KEYS: ApiKey[] = [
  { id: "pw_live_9fK2mQ4xR7Qa", name: "Production server", mode: "live", createdAt: "12 Aug 2026", createdBy: "Rohan S.", lastUsed: "2 min ago", servers: 2, calls: CALLS },
  { id: "pw_live_3Xc8vB1nT5Lm", name: "Old production key", mode: "live", createdAt: "03 Feb 2026", createdBy: "Rohan S.", lastUsed: "Yesterday", expiresInMinutes: 23 * 60 + 41, regeneratedOn: "22 Nov", servers: 3, calls: CALLS.slice(1) },
  { id: "pw_test_7Hd3kL9pQ2Za", name: "Staging", mode: "test", createdAt: "12 Aug 2026", createdBy: "Karan M.", lastUsed: "1 hour ago", servers: 1, calls: CALLS.slice(0, 2) },
];

export const ALLOWED_IPS: AllowedIp[] = [
  { ip: "103.21.58.14", label: "Production server", addedBy: "Rohan S." },
  { ip: "103.21.59.0/24", label: "Mumbai office", addedBy: "Meera I." },
];
