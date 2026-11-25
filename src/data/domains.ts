export type DomainStatus = "verified" | "pending";

export type Domain = { id: string; name: string; mode: "live" | "test"; status: DomainStatus; token: string };

export const DOMAINS: Domain[] = [
  { id: "dm1", name: "sharmatextiles.in", mode: "live", status: "verified", token: "pw-verify=5c1e88d2a4b0" },
  { id: "dm2", name: "staging.sharmatextiles.in", mode: "test", status: "verified", token: "pw-verify=0d7a3f61c9e2" },
  { id: "dm3", name: "shop.sharmatexti.in", mode: "live", status: "pending", token: "pw-verify=ab12f9c4e07d" },
];

export type ReturnUrls = { success: string; failure: string; cancel: string };

export const RETURN_URLS: ReturnUrls = {
  success: "https://sharmatextiles.in/order/success",
  failure: "http://sharmatextiles.in/order/failed",
  cancel: "",
};
