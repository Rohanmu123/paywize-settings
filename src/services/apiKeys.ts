import { ALLOWED_IPS, API_KEYS, type AllowedIp, type ApiKey, type KeyMode } from "@/data/apiKeys";
import { createStore } from "@/lib/store";
import { delay } from "./delay";

type State = { keys: ApiKey[]; ips: AllowedIp[]; enforceIps: boolean; secrets: Record<string, string> };

export const apiKeysStore = createStore<State>({ keys: API_KEYS, ips: ALLOWED_IPS, enforceIps: true, secrets: {} });

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
function random(n: number) {
  const bytes = new Uint8Array(n);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => CHARS[b % CHARS.length]).join("");
}

function today() {
  return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function keyStatus(k: ApiKey): { label: string; tone: "success" | "warning" } {
  return k.expiresInMinutes != null ? { label: `Expires in ${Math.floor(k.expiresInMinutes / 60)}h`, tone: "warning" } : { label: "Active", tone: "success" };
}

export function formatRemaining(min: number) {
  return `${Math.floor(min / 60)} h ${min % 60} m`;
}

export function maskSecret(mode: KeyMode) {
  return `sk_${mode}_${"•".repeat(22)}`;
}

/** Creates a key pair; returns the new key id. The secret is kept only until the "generated" pop-up closes. */
export async function generateKey(name: string, mode: KeyMode) {
  await delay();
  const id = `pw_${mode}_${random(12)}`;
  const secret = `sk_${mode}_${random(32)}`;
  const key: ApiKey = { id, name: name.trim() || "Untitled key", mode, createdAt: today(), createdBy: "Rohan S.", lastUsed: "Never", servers: 0, calls: [] };
  apiKeysStore.set((s) => ({ ...s, keys: [key, ...s.keys], secrets: { ...s.secrets, [id]: secret } }));
  return id;
}

/** Issues a new pair; the old key keeps working for 24 hours. */
export async function regenerateKey(oldId: string) {
  const old = apiKeysStore.get().keys.find((k) => k.id === oldId);
  const id = await generateKey(old?.name ?? "", old?.mode ?? "live");
  const on = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  apiKeysStore.set((s) => ({ ...s, keys: s.keys.map((k) => (k.id === oldId ? { ...k, expiresInMinutes: 24 * 60, regeneratedOn: on } : k)) }));
  return id;
}

export function forgetSecret(id: string) {
  apiKeysStore.set((s) => {
    const secrets = { ...s.secrets };
    delete secrets[id];
    return { ...s, secrets };
  });
}

export async function revokeKey(id: string) {
  await delay();
  apiKeysStore.set((s) => ({ ...s, keys: s.keys.filter((k) => k.id !== id) }));
}

const IPV4 = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

export function validateIp(value: string): string | null {
  const v = value.trim();
  const [ip, bits, extra] = v.split("/");
  const ok = extra === undefined && IPV4.test(ip ?? "") && (bits === undefined || (/^\d{1,2}$/.test(bits) && Number(bits) <= 32));
  if (!ok) return "Enter a valid IPv4 address or CIDR range, for example 10.0.0.0/24";
  if (apiKeysStore.get().ips.some((x) => x.ip === v)) return "This address is already on the list";
  return null;
}

export async function addIp(ip: string, label: string) {
  await delay();
  apiKeysStore.set((s) => ({ ...s, ips: [...s.ips, { ip: ip.trim(), label: label.trim() || "—", addedBy: "Rohan S." }] }));
}

export async function removeIp(ip: string) {
  await delay();
  apiKeysStore.set((s) => ({ ...s, ips: s.ips.filter((x) => x.ip !== ip) }));
}

export async function setEnforceIps(on: boolean) {
  await delay();
  apiKeysStore.set((s) => ({ ...s, enforceIps: on }));
}
