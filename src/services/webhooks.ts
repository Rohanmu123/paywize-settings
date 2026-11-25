import { DELIVERIES, ENDPOINTS, EVENT_GROUPS, type Endpoint, type EventGroup } from "@/data/webhooks";
import { createStore } from "@/lib/store";
import { delay } from "./delay";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
function secret() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return "whsec_" + Array.from(bytes, (b) => CHARS[b % CHARS.length]).join("");
}

export const webhooksStore = createStore({ endpoints: ENDPOINTS, deliveries: DELIVERIES, secret: "whsec_4fT9kQ2mXp7Lr3Vn8Bz6Hc1W" });

export const eventCount = (e: Endpoint) => EVENT_GROUPS[e.group].events.length;
export const hostOf = (url: string) => url.replace(/^https?:\/\//, "").split("/")[0].replace(/\.(in|com)$/, "");
export const shortUrl = (url: string) => url.replace(/^https?:\/\//, "");

export function validateEndpointUrl(url: string, ignoreId?: string): string | null {
  const v = url.trim();
  let u: URL;
  try {
    u = new URL(v);
  } catch {
    return "Enter a full URL, for example https://example.com/webhooks";
  }
  if (u.protocol !== "https:") return "Use an https:// address";
  if (!u.hostname.includes(".")) return "Enter a public domain";
  if (webhooksStore.get().endpoints.some((e) => e.url === v && e.id !== ignoreId)) return "This endpoint is already added";
  return null;
}

export async function saveEndpoint(input: { id?: string; url: string; group: EventGroup }) {
  await delay();
  webhooksStore.set((s) => {
    if (input.id) return { ...s, endpoints: s.endpoints.map((e) => (e.id === input.id ? { ...e, url: input.url.trim(), group: input.group } : e)) };
    const ep: Endpoint = {
      id: `ep${Date.now()}`,
      url: input.url.trim(),
      group: input.group,
      successRate: "—",
      status: "active",
      addedOn: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      addedBy: "Rohan S.",
      lastDelivery: "Never",
    };
    return { ...s, endpoints: [...s.endpoints, ep] };
  });
}

export async function retryEndpoint(id: string) {
  await delay();
  webhooksStore.set((s) => ({ ...s, endpoints: s.endpoints.map((e) => (e.id === id ? { ...e, status: "active", pendingEvents: undefined, failure: undefined } : e)) }));
}

export async function sendTestEvent() {
  await delay();
}

export async function resendDelivery() {
  await delay();
}

export async function rollSecret() {
  await delay();
  webhooksStore.set((s) => ({ ...s, secret: secret() }));
}

export function deliveryLogCsv() {
  const { deliveries, endpoints } = webhooksStore.get();
  const rows = deliveries.map((d) => [d.event, endpoints.find((e) => e.id === d.endpointId)?.url ?? "", d.response.label, d.at, `${d.ms} ms`]);
  return [["Event", "Endpoint", "Response", "Time", "Duration"], ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
}

export function downloadDeliveryLog() {
  const url = URL.createObjectURL(new Blob([deliveryLogCsv()], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "webhook-deliveries.csv";
  a.click();
  URL.revokeObjectURL(url);
}
