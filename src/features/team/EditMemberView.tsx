"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Shield } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SaveBar } from "@/components/layout/SaveBar";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { DataTable } from "@/components/ui/DataTable";
import { Select } from "@/components/ui/Select";
import { TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/Toast";
import { SERVICES, type Member, type ServiceId, type ServiceMode } from "@/data/team";
import { ROUTES } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { useModal } from "@/lib/useModal";
import { membersStore, roleById, rolesStore, sendPasswordReset, signOutMember, updateMember } from "@/services/team";
import { RemoveMemberModal, ResetTwoFactorModal, SuspendMemberModal } from "./EditMemberModals";
import { ServiceAccessTable } from "./ServiceAccessTable";

const STATUS_CHIP = { active: { label: "Active", tone: "success" }, invited: { label: "Invited", tone: "neutral" }, suspended: { label: "Suspended", tone: "error" } } as const;

export function memberChanges(initial: Pick<Member, "role" | "jobTitle" | "access">, current: Pick<Member, "role" | "jobTitle" | "access">) {
  let n = 0;
  if (initial.role !== current.role) n++;
  if (initial.jobTitle.trim() !== current.jobTitle.trim()) n++;
  for (const s of SERVICES) if (initial.access[s.id] !== current.access[s.id]) n++;
  return n;
}

export function memberSaveBarMessage(changes: number, roleChanged: boolean) {
  if (changes === 0) return "No changes";
  return `${changes} change${changes === 1 ? "" : "s"}${roleChanged ? " · role change asks for a code" : ""}`;
}

export function EditMemberView({ id }: { id: string }) {
  const members = useStore(membersStore);
  const member = members.find((m) => m.id === id);
  if (!member) {
    return (
      <>
        <PageHeader title="Edit member" backHref={ROUTES.team} scope="Applies to every service" />
        <Card>
          <p className="type-14r text-text-secondary">
            This member is no longer on the team.{" "}
            <Link href={ROUTES.team} className="type-14sb text-primary">
              Back to Team & roles
            </Link>
          </p>
        </Card>
      </>
    );
  }
  return <EditMemberForm key={member.id} member={member} />;
}

function EditMemberForm({ member }: { member: Member }) {
  const router = useRouter();
  const toast = useToast();
  const roles = useStore(rolesStore);
  const modal = useModal<"reset-2fa" | "suspend" | "remove">();
  const [initial] = useState(() => ({ role: member.role, jobTitle: member.jobTitle, access: { ...member.access } }));
  const [role, setRole] = useState(member.role);
  const [jobTitle, setJobTitle] = useState(member.jobTitle);
  const [access, setAccess] = useState<Record<ServiceId, ServiceMode>>({ ...member.access });
  const [saving, setSaving] = useState(false);
  const isOwner = member.role === "owner";
  const changes = useMemo(() => memberChanges(initial, { role, jobTitle, access }), [initial, role, jobTitle, access]);
  const status = STATUS_CHIP[member.status];
  const roleName = roleById(roles, role)?.name ?? "—";

  const save = async () => {
    setSaving(true);
    await updateMember(member.id, { role, jobTitle: jobTitle.trim(), access });
    toast.show("changes-saved");
    router.push(ROUTES.team);
  };

  const security = [
    { id: "2fa", item: "Two-factor", status: member.twoFactor === "on" ? <Chip tone="success">SMS code</Chip> : <Chip tone="error">Off</Chip>, event: member.twoFactorEvent, action: <Button size="sm" variant="outline" onClick={() => modal.open("reset-2fa")} disabled={member.twoFactor !== "on"}>Reset</Button> },
    { id: "sessions", item: "Sessions", status: `${member.sessions} device${member.sessions === 1 ? "" : "s"}`, event: member.sessions ? "Today, 11:02 AM" : "—", action: <Button size="sm" variant="outline" disabled={!member.sessions} onClick={async () => { await signOutMember(member.id); toast.show("changes-saved"); }}>Sign out</Button> },
    { id: "password", item: "Password", status: member.passwordChanged, event: member.passwordEvent, action: <Button size="sm" variant="outline" onClick={async () => { await sendPasswordReset(member.id); toast.show("request-submitted"); }}>Send reset</Button> },
  ];

  return (
    <>
      <PageHeader title="Edit member" subtitle={`· ${member.name}`} backHref={ROUTES.team} scope="Applies to every service" />

      <section aria-label="Member summary" className="flex w-full items-center gap-4 overflow-clip rounded-3xl bg-surface px-5 py-4">
        <Avatar name={member.name} size={64} tone="primary-container" />
        <div className="flex min-w-px flex-1 flex-col items-start gap-1">
          <div className="flex items-center gap-2.5">
            <h1 className="type-20sb text-text-primary whitespace-nowrap">{member.name}</h1>
            <Chip tone={status.tone}>{status.label}</Chip>
            <Chip tone="brand">{roleName}</Chip>
          </div>
          <p className="type-14r text-text-secondary whitespace-nowrap">
            {member.email} · Joined {member.joined} · Last active {member.lastActiveFull}
          </p>
        </div>
      </section>

      <Card aria-label="Role">
        <CardHeader icon={Shield} title="Role" />
        <div className="flex w-full items-start gap-4">
          <Select
            label="Role"
            value={role}
            disabled={isOwner}
            helper={isOwner ? "Transfer ownership from Business profile to change this." : undefined}
            onChange={(e) => setRole(e.target.value)}
            options={roles.filter((r) => isOwner || r.id !== "owner").map((r) => ({ value: r.id, label: r.name }))}
          />
          <TextField label="Job title (optional)" value={jobTitle} maxLength={60} onChange={(e) => setJobTitle(e.target.value)} />
        </div>
      </Card>

      <Card aria-label="Service access">
        <CardHeader icon={Lock} title="Service access" />
        <ServiceAccessTable value={access} onChange={setAccess} />
      </Card>

      <Card aria-label="Sign-in and security">
        <CardHeader icon={Shield} title="Sign-in and security" />
        <DataTable
          caption="Sign-in and security"
          rows={security}
          rowKey={(r) => r.id}
          columns={[
            { key: "item", header: "Item", render: (r) => r.item },
            { key: "status", header: "Status", width: 260, render: (r) => r.status },
            { key: "event", header: "Last event", width: 170, render: (r) => r.event },
            { key: "action", header: <span className="sr-only">Action</span>, width: 141, align: "right", render: (r) => r.action },
          ]}
        />
      </Card>

      {!isOwner && (
        <section aria-label="Suspend or remove" className="flex w-full items-center justify-between overflow-clip rounded-3xl bg-error-container p-5">
          <div className="flex flex-col items-start gap-1 text-on-error-container">
            <button type="button" className="type-14sb whitespace-nowrap hover:underline" onClick={() => modal.open("suspend")}>
              Suspend or remove
            </button>
            <p className="w-[520px] type-12r">Suspending keeps history and blocks sign-in. Removing deletes access for good.</p>
          </div>
          <div className="flex items-start gap-3">
            {member.status === "suspended" ? (
              <Button variant="outline" onClick={async () => { await updateMember(member.id, { status: "active" }); toast.show("changes-saved"); }}>Restore</Button>
            ) : (
              <Button variant="outline" onClick={() => modal.open("suspend")}>Suspend</Button>
            )}
            <Button variant="danger" onClick={() => modal.open("remove")}>Remove from team</Button>
          </div>
        </section>
      )}

      <SaveBar message={memberSaveBarMessage(changes, role !== initial.role)} onDiscard={() => router.push(ROUTES.team)} onSave={save} saveDisabled={saving} />

      <ResetTwoFactorModal open={modal.is("reset-2fa")} onClose={modal.close} member={member} />
      <SuspendMemberModal open={modal.is("suspend")} onClose={modal.close} member={member} />
      <RemoveMemberModal open={modal.is("remove")} onClose={modal.close} member={member} />
    </>
  );
}
