"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { Avatar, type AvatarTone } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Chip, type ChipTone } from "@/components/ui/Chip";
import { DataTable } from "@/components/ui/DataTable";
import { FilterChip } from "@/components/ui/FilterChip";
import { Icon } from "@/components/ui/Icon";
import { SUMMARY_PERMISSIONS, type Member, type MemberStatus, type Role } from "@/data/team";
import { ROUTES } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { useModal } from "@/lib/useModal";
import { memberCounts, membersStore, roleById, rolesStore, serviceSummary } from "@/services/team";
import { InviteMemberModal, ViewRoleModal } from "./TeamModals";

type Filter = "all" | MemberStatus;
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "invited", label: "Invited" },
  { id: "suspended", label: "Suspended" },
];

export function roleChip(m: Member, roles: Role[]): { label: string; tone: ChipTone; avatar: AvatarTone } {
  if (m.status === "invited") return { label: "Invited", tone: "neutral", avatar: "container" };
  if (m.status === "suspended") return { label: "Suspended", tone: "error", avatar: "error" };
  const r = roleById(roles, m.role);
  return { label: r?.name ?? "—", tone: r?.tone ?? "neutral", avatar: r?.avatar ?? "container" };
}

const Dash = () => <span className="text-text-tertiary">—</span>;

export function TeamView() {
  const members = useStore(membersStore);
  const roles = useStore(rolesStore);
  const modal = useModal<"invite" | "view-role">();
  const [filter, setFilter] = useState<Filter>("all");
  const [show2faAlert, setShow2faAlert] = useState(true);
  const [showBankAlert, setShowBankAlert] = useState(true);
  const counts = memberCounts(members);
  const rows = filter === "all" ? members : members.filter((m) => m.status === filter);
  const no2fa = members.find((m) => m.status === "active" && m.twoFactor === "off");

  return (
    <>
      <PageHeader title="Team & roles" scope="Applies to every service" />

      <Card aria-label="Team members">
        <CardHeader
          icon={Users}
          title="Team members"
          action={
            <Button size="sm" onClick={() => modal.open("invite")}>
              Invite member
            </Button>
          }
        />
        <div className="flex items-center gap-2" role="group" aria-label="Filter members">
          {FILTERS.map((f) => (
            <FilterChip key={f.id} selected={filter === f.id} onClick={() => setFilter(f.id)}>
              {`${f.label}  ${counts[f.id]}`}
            </FilterChip>
          ))}
        </div>
        <DataTable
          caption="Team members"
          rows={rows}
          rowKey={(m) => m.id}
          columns={[
            {
              key: "member",
              header: "Member",
              render: (m) => (
                <div className="flex items-center gap-2.5">
                  <Avatar name={m.name} size={32} tone={roleChip(m, roles).avatar} />
                  <div className="flex min-w-0 flex-col">
                    <span className="type-12m text-text-primary">{m.name}</span>
                    <span className="type-12m text-text-secondary">{m.email}</span>
                  </div>
                </div>
              ),
            },
            {
              key: "role",
              header: "Role",
              width: 115,
              render: (m) => {
                const c = roleChip(m, roles);
                return m.status === "active" ? (
                  <button type="button" onClick={() => modal.open("view-role", m.role)} aria-label={`View ${c.label} role`}>
                    <Chip tone={c.tone}>{c.label}</Chip>
                  </button>
                ) : (
                  <Chip tone={c.tone}>{c.label}</Chip>
                );
              },
            },
            { key: "access", header: "Service access", width: 150, render: (m) => (m.status === "suspended" ? <Dash /> : serviceSummary(m.access)) },
            { key: "2fa", header: "2FA", width: 72, render: (m) => (m.twoFactor === "on" ? <Chip tone="success">On</Chip> : m.twoFactor === "off" ? <Chip tone="error">Off</Chip> : <Dash />) },
            { key: "last", header: "Last active", width: 122, render: (m) => <span className={m.status === "invited" ? "text-text-secondary" : undefined}>{m.lastActive}</span> },
            {
              key: "action",
              header: <span className="sr-only">Actions</span>,
              width: 50,
              align: "right",
              render: (m) => (
                <Link href={ROUTES.editMember(m.id)} aria-label={`Edit ${m.name}`} className="type-12m text-text-tertiary hover:text-text-primary">
                  •••
                </Link>
              ),
            },
          ]}
        />
        {show2faAlert && no2fa && (
          <Alert tone="warning" title={`${no2fa.name} has 2FA turned off`} onDismiss={() => setShow2faAlert(false)}>
            {`${roleById(roles, no2fa.role)?.name ?? "Member"}s can view API keys. Turn on “Require 2FA for everyone” in Security to enforce it.`}
          </Alert>
        )}
      </Card>

      <Card aria-label="Roles and permissions">
        <CardHeader icon={Users} title="Roles & permissions" action={<Link href={ROUTES.createRole} className="type-12sb whitespace-nowrap text-primary underline-offset-2 hover:underline">Create custom role</Link>} />
        <DataTable
          caption="Roles and permissions"
          rows={roles}
          rowKey={(r) => r.id}
          onRowClick={(r) => modal.open("view-role", r.id)}
          columns={[
            { key: "role", header: "Role", render: (r) => r.name },
            ...SUMMARY_PERMISSIONS.map((p, i) => ({
              key: p,
              header: p,
              width: 110,
              render: (r: Role) => (r.summary[i] ? <Icon icon={Check} size={16} strokeWidth={1.5} className="text-success" aria-label="Allowed" /> : <Dash />),
            })),
          ]}
        />
        {showBankAlert && (
          <Alert tone="info" title="Bank-account changes always need the Owner" onDismiss={() => setShowBankAlert(false)}>
            Even Finance members cannot change a settlement account without Owner approval and a one-time code.
          </Alert>
        )}
      </Card>

      <InviteMemberModal open={modal.is("invite")} onClose={modal.close} />
      <ViewRoleModal open={modal.is("view-role")} onClose={modal.close} roleId={modal.target ?? "viewer"} />
    </>
  );
}
