import type { AvatarTone } from "@/components/ui/Avatar";
import type { ChipTone } from "@/components/ui/Chip";

export type RoleId = "owner" | "admin" | "finance" | "developer" | "support" | "viewer" | (string & {});
export type MemberStatus = "active" | "invited" | "suspended";
export type ServiceId = "gateway" | "links" | "payouts";
export type ServiceMode = "live-test" | "test" | "none";

export const SERVICES: { id: ServiceId; label: string }[] = [
  { id: "gateway", label: "Payment Gateway" },
  { id: "links", label: "Payment Links" },
  { id: "payouts", label: "Payouts" },
];

export const SERVICE_MODE: Record<ServiceMode, { label: string; tone: ChipTone }> = {
  "live-test": { label: "Live and test", tone: "success" },
  test: { label: "Test only", tone: "info" },
  none: { label: "No access", tone: "neutral" },
};

export type Member = {
  id: string;
  name: string;
  email: string;
  role: RoleId;
  status: MemberStatus;
  twoFactor: "on" | "off" | null;
  lastActive: string;
  joined: string;
  lastActiveFull: string;
  jobTitle: string;
  access: Record<ServiceId, ServiceMode>;
  sessions: number;
  passwordChanged: string;
  passwordEvent: string;
  twoFactorEvent: string;
};

/** Summary matrix shown in "Roles & permissions". */
export const SUMMARY_PERMISSIONS = ["View payments", "Refunds", "Bank account", "API keys", "Team", "Settings"] as const;

/** Detailed areas (View role pop-up + Create custom role). */
export const PERMISSION_AREAS = [
  { id: "payments", label: "Payments and orders", needsCode: false },
  { id: "refunds", label: "Refunds", needsCode: true },
  { id: "settlements", label: "Settlements and payouts", needsCode: true },
  { id: "reports", label: "Reports and downloads", needsCode: false },
  { id: "apiKeys", label: "API keys", needsCode: true },
  { id: "webhooks", label: "Webhooks", needsCode: false },
  { id: "team", label: "Team and roles", needsCode: true },
  { id: "business", label: "Business settings", needsCode: false },
  { id: "compliance", label: "Compliance and KYC", needsCode: false },
] as const;
export type AreaId = (typeof PERMISSION_AREAS)[number]["id"];
export const ACTIONS = ["view", "create", "edit", "approve"] as const;
export type Action = (typeof ACTIONS)[number];
export type PermissionSet = Record<AreaId, Record<Action, boolean>>;

/** Cells that do not apply to an area (rendered as disabled checkboxes). */
export const NOT_APPLICABLE: Partial<Record<AreaId, Action[]>> = {
  settlements: ["create"],
  business: ["create", "approve"],
  compliance: ["approve"],
};

export type Role = {
  id: RoleId;
  name: string;
  builtIn: boolean;
  description?: string;
  tone: ChipTone;
  avatar: AvatarTone;
  summary: boolean[];
  permissions: PermissionSet;
  services: ServiceId[];
};

const P = (rows: Partial<Record<AreaId, string>>): PermissionSet =>
  Object.fromEntries(
    PERMISSION_AREAS.map((a) => {
      const r = rows[a.id] ?? "";
      return [a.id, { view: r.includes("v"), create: r.includes("c"), edit: r.includes("e"), approve: r.includes("a") }];
    }),
  ) as PermissionSet;

const ALL = "vcea";

export const ROLES: Role[] = [
  { id: "owner", name: "Owner", builtIn: true, tone: "brand", avatar: "primary-container", summary: [true, true, true, true, true, true], services: ["gateway", "links", "payouts"], permissions: P({ payments: ALL, refunds: ALL, settlements: "vea", reports: ALL, apiKeys: ALL, webhooks: ALL, team: ALL, business: "ve", compliance: "vce" }) },
  { id: "admin", name: "Admin", builtIn: true, tone: "info", avatar: "info", summary: [true, true, false, true, true, true], services: ["gateway", "links", "payouts"], permissions: P({ payments: ALL, refunds: ALL, settlements: "v", reports: ALL, apiKeys: ALL, webhooks: ALL, team: ALL, business: "ve", compliance: "vce" }) },
  { id: "finance", name: "Finance", builtIn: true, tone: "success", avatar: "success", summary: [true, true, true, false, false, false], services: ["gateway", "payouts"], permissions: P({ payments: "vc", refunds: "vc", settlements: "v", reports: "vce", webhooks: "", business: "", compliance: "" }) },
  { id: "developer", name: "Developer", builtIn: true, tone: "warning", avatar: "warning", summary: [true, false, false, true, false, false], services: ["gateway", "links"], permissions: P({ payments: "v", reports: "v", apiKeys: "vce", webhooks: "vce" }) },
  { id: "support", name: "Support", builtIn: true, tone: "neutral", avatar: "container", summary: [true, true, false, false, false, false], services: ["gateway", "links"], permissions: P({ payments: "v", refunds: "vc", reports: "v" }) },
  { id: "viewer", name: "Viewer", builtIn: true, tone: "neutral", avatar: "container", summary: [true, false, false, false, false, false], services: ["gateway"], permissions: P({ payments: "v", reports: "v" }) },
];

/** Starting point for "Create custom role" (Figma: Finance template + read-only extras). */
export const CUSTOM_ROLE_DRAFT = {
  name: "Reconciliation analyst",
  template: "finance",
  description: "Sees payments and settlements, downloads reports. No access to keys, bank or team.",
  permissions: P({ payments: "vc", refunds: "vc", settlements: "v", reports: "vce", webhooks: "v", business: "v", compliance: "v" }),
  access: { gateway: "live-test", links: "live-test", payouts: "none" } as Record<ServiceId, ServiceMode>,
};
export const ROLE_DESCRIPTION_MAX = 160;

const base = { joined: "12 Aug 2026", sessions: 1, passwordChanged: "Changed 42 days ago", passwordEvent: "23 Sep", twoFactorEvent: "Set up 14 Aug", jobTitle: "" };

export const MEMBERS: Member[] = [
  { ...base, id: "rohan", name: "Rohan Sharma", email: "rohan@sharmatextiles.in", role: "owner", status: "active", twoFactor: "on", lastActive: "Now", lastActiveFull: "now", jobTitle: "Founder", joined: "3 Feb 2024", access: { gateway: "live-test", links: "live-test", payouts: "live-test" } },
  { ...base, id: "meera", name: "Meera Iyer", email: "meera@sharmatextiles.in", role: "admin", status: "active", twoFactor: "on", lastActive: "2 hours ago", lastActiveFull: "today, 11:02 AM", jobTitle: "Accounts lead", sessions: 2, access: { gateway: "live-test", links: "test", payouts: "none" } },
  { ...base, id: "karan", name: "Karan Shah", email: "karan@sharmatextiles.in", role: "finance", status: "active", twoFactor: "on", lastActive: "Yesterday", lastActiveFull: "yesterday, 6:40 PM", jobTitle: "Finance manager", access: { gateway: "live-test", links: "none", payouts: "live-test" } },
  { ...base, id: "divya", name: "Divya Nair", email: "divya@sharmatextiles.in", role: "developer", status: "active", twoFactor: "off", lastActive: "3 days ago", lastActiveFull: "22 Nov, 4:15 PM", jobTitle: "Engineer", twoFactorEvent: "Never set up", access: { gateway: "test", links: "live-test", payouts: "none" } },
  { ...base, id: "imran", name: "Imran Khan", email: "imran@sharmatextiles.in", role: "viewer", status: "invited", twoFactor: null, lastActive: "Expires in 2 days", lastActiveFull: "never", sessions: 0, passwordChanged: "Not set", passwordEvent: "—", twoFactorEvent: "—", access: { gateway: "none", links: "live-test", payouts: "none" } },
  { ...base, id: "neha", name: "Neha Rao", email: "neha@sharmatextiles.in", role: "support", status: "suspended", twoFactor: null, lastActive: "41 days ago", lastActiveFull: "15 Oct, 9:20 AM", sessions: 0, access: { gateway: "none", links: "none", payouts: "none" } },
];

/** Rows shown in the "View role" pop-up. */
export const VIEW_ROLE_AREAS: AreaId[] = ["payments", "refunds", "settlements", "reports", "apiKeys", "team"];
