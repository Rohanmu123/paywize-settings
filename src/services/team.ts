import { CUSTOM_ROLE_DRAFT, MEMBERS, ROLES, type Member, type PermissionSet, type Role, type RoleId, type ServiceId, type ServiceMode } from "@/data/team";
import { createStore } from "@/lib/store";
import { delay } from "./delay";

export const membersStore = createStore<Member[]>(MEMBERS);
export const rolesStore = createStore<Role[]>(ROLES);

export function roleById(roles: Role[], id: RoleId) {
  return roles.find((r) => r.id === id);
}

export function memberCounts(members: Member[]) {
  return {
    all: members.length,
    active: members.filter((m) => m.status === "active").length,
    invited: members.filter((m) => m.status === "invited").length,
    suspended: members.filter((m) => m.status === "suspended").length,
  };
}

export function membersWithRole(members: Member[], role: RoleId) {
  return members.filter((m) => m.role === role && m.status !== "invited").length;
}

/** Human summary of service access, e.g. "Gateway, Payouts" / "All services" / "—". */
export function serviceSummary(access: Record<ServiceId, ServiceMode>) {
  const on = (Object.keys(access) as ServiceId[]).filter((k) => access[k] !== "none");
  if (on.length === 3) return "All services";
  if (on.length === 0) return "—";
  if (on.length === 1) return { gateway: "Payment Gateway", links: "Payment Links", payouts: "Payouts" }[on[0]!];
  return on.map((k) => ({ gateway: "Gateway", links: "Links", payouts: "Payouts" })[k]).join(", ");
}

export function countPermissions(p: PermissionSet) {
  return Object.values(p).reduce((n, row) => n + Object.values(row).filter(Boolean).length, 0);
}

export async function inviteMember(input: { email: string; role: RoleId }) {
  await delay();
  const local = input.email.split("@")[0] ?? input.email;
  const name = local.replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const member: Member = {
    ...MEMBERS[4]!,
    id: `inv-${Date.now()}`,
    name,
    email: input.email,
    role: input.role,
    status: "invited",
    lastActive: "Expires in 7 days",
  };
  membersStore.set((ms) => [...ms, member]);
  return member;
}

export async function updateMember(id: string, patch: Partial<Member>) {
  await delay();
  membersStore.set((ms) => ms.map((m) => (m.id === id ? { ...m, ...patch } : m)));
}

export const suspendMember = (id: string) => updateMember(id, { status: "suspended", sessions: 0, lastActive: "Just now" });
export const resetTwoFactor = (id: string) => updateMember(id, { twoFactor: "off", twoFactorEvent: "Reset just now" });
export const signOutMember = (id: string) => updateMember(id, { sessions: 0 });

export async function removeMember(id: string) {
  await delay();
  membersStore.set((ms) => ms.filter((m) => m.id !== id));
}

export async function sendPasswordReset(id: string) {
  await delay();
  membersStore.set((ms) => ms.map((m) => (m.id === id ? { ...m, passwordEvent: "Reset sent" } : m)));
}

export async function createRole(input: { name: string; description: string; permissions: PermissionSet; access: Record<ServiceId, ServiceMode> }) {
  await delay();
  const p = input.permissions;
  const role: Role = {
    id: `custom-${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name: input.name.trim(),
    description: input.description,
    builtIn: false,
    tone: "neutral",
    avatar: "container",
    permissions: p,
    services: (Object.keys(input.access) as ServiceId[]).filter((k) => input.access[k] !== "none"),
    summary: [p.payments.view, p.refunds.create, p.settlements.edit || p.settlements.approve, p.apiKeys.view, p.team.view, p.business.edit],
  };
  rolesStore.set((rs) => [...rs.filter((r) => r.id !== role.id), role]);
  return role;
}

export function templatePermissions(roles: Role[], template: string): PermissionSet {
  if (template === "finance") return structuredClone(CUSTOM_ROLE_DRAFT.permissions);
  const r = roleById(roles, template);
  return structuredClone(r ? r.permissions : CUSTOM_ROLE_DRAFT.permissions);
}
