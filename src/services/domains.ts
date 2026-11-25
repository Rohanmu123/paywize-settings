import { DOMAINS, RETURN_URLS, type Domain, type ReturnUrls } from "@/data/domains";
import { createStore } from "@/lib/store";
import { delay } from "./delay";

export const domainsStore = createStore({ domains: DOMAINS, urls: RETURN_URLS, allowIframe: false });

const HEX = "0123456789abcdef";
export function newVerifyToken() {
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  return "pw-verify=" + Array.from(bytes, (b) => HEX[b % 16]).join("");
}

const DOMAIN_RE = /^(?=.{4,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

export function normaliseDomain(v: string) {
  return v.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
}

export function validateDomain(v: string): string | null {
  const d = normaliseDomain(v);
  if (!d) return "Enter a domain";
  if (!DOMAIN_RE.test(d)) return "Enter a domain like checkout.example.in";
  if (domainsStore.get().domains.some((x) => x.name === d)) return "This domain is already added";
  return null;
}

export async function addDomain(name: string, mode: Domain["mode"], token: string) {
  await delay();
  const d: Domain = { id: `dm${Date.now()}`, name: normaliseDomain(name), mode, status: "pending", token };
  domainsStore.set((s) => ({ ...s, domains: [...s.domains, d] }));
}

export async function removeDomain(id: string) {
  await delay();
  domainsStore.set((s) => ({ ...s, domains: s.domains.filter((d) => d.id !== id) }));
}

/** Mock DNS lookup: the record is found on the first manual check. */
export async function checkDomain(id: string) {
  await delay(900);
  domainsStore.set((s) => ({ ...s, domains: s.domains.map((d) => (d.id === id ? { ...d, status: "verified" } : d)) }));
}

export function validateReturnUrl(v: string, optional = false): string | null {
  const t = v.trim();
  if (!t || t === "https://") return optional ? null : "Enter a URL";
  let u: URL;
  try {
    u = new URL(t);
  } catch {
    return "Enter a full URL, for example https://example.com/done";
  }
  if (u.protocol === "http:") return "Use https:// . Plain http links are blocked in live mode.";
  if (u.protocol !== "https:") return "Use an https:// address";
  return null;
}

export async function saveReturnUrl(key: keyof ReturnUrls, value: string) {
  await delay();
  domainsStore.set((s) => ({ ...s, urls: { ...s.urls, [key]: value.trim() === "https://" ? "" : value.trim() } }));
}

export async function setAllowIframe(on: boolean) {
  await delay();
  domainsStore.set((s) => ({ ...s, allowIframe: on }));
}
