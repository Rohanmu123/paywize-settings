"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { DataTable } from "@/components/ui/DataTable";
import { Icon } from "@/components/ui/Icon";
import { Modal, ModalActions } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/Toast";
import { ACTIONS, PERMISSION_AREAS, VIEW_ROLE_AREAS, type Action, type AreaId, type RoleId } from "@/data/team";
import { ROUTES } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { isEmail } from "@/lib/validation";
import { inviteMember, membersStore, membersWithRole, roleById, rolesStore } from "@/services/team";

export function InviteMemberModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const roles = useStore(rolesStore);
  const members = useStore(membersStore);
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<RoleId>("viewer");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setEmail("");
    setRole("viewer");
    setError(null);
  }, [open]);

  const submit = async () => {
    const value = email.trim();
    if (!isEmail(value)) return setError("Enter a valid email address");
    if (members.some((m) => m.email.toLowerCase() === value.toLowerCase())) return setError("This person is already on the team");
    setBusy(true);
    await inviteMember({ email: value, role });
    setBusy(false);
    onClose();
    toast.show("invitation-sent");
  };

  return (
    <Modal open={open} onClose={onClose} width={364} title="Invite member" description="They will receive an email invitation." testId="invite-member-modal">
      <TextField label="Email" type="email" placeholder="name@company.com" containerClassName="w-full" value={email} onChange={(e) => { setEmail(e.target.value); setError(null); }} error={error} autoFocus />
      <Select label="Role" containerClassName="w-full" value={role} onChange={(e) => setRole(e.target.value)} options={roles.filter((r) => r.id !== "owner").map((r) => ({ value: r.id, label: r.name }))} />
      <p className="type-12r text-text-secondary">Roles control access to settings and money movement.</p>
      <ModalActions>
        <Button variant="outline" block onClick={onClose}>Cancel</Button>
        <Button block onClick={submit} disabled={busy}>Send invite</Button>
      </ModalActions>
    </Modal>
  );
}

const WIDTH: Record<Action, number> = { view: 70, create: 80, edit: 70, approve: 90 };
const LABEL = Object.fromEntries(PERMISSION_AREAS.map((a) => [a.id, a.label])) as Record<AreaId, string>;

export function ViewRoleModal({ open, onClose, roleId }: { open: boolean; onClose: () => void; roleId: RoleId }) {
  const roles = useStore(rolesStore);
  const members = useStore(membersStore);
  const router = useRouter();
  const role = roleById(roles, roleId) ?? roles[roles.length - 1]!;
  const count = membersWithRole(members, role.id);
  const kind = role.builtIn ? "Built-in role" : "Custom role";

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={565}
      testId="view-role-modal"
      title={
        <span className="flex items-center gap-2">
          {role.name}
          <Chip tone="neutral">{role.builtIn ? "Built-in" : "Custom"}</Chip>
        </span>
      }
      description={`${kind} · ${count} member${count === 1 ? "" : "s"}`}
    >
      <DataTable
        caption={`${role.name} permissions`}
        headerTone="container"
        rowHeight={40}
        rows={VIEW_ROLE_AREAS}
        rowKey={(a) => a}
        columns={[
          { key: "area", header: "Permission", render: (a) => LABEL[a] },
          ...ACTIONS.map((act) => ({
            key: act,
            header: act,
            width: WIDTH[act],
            render: (a: AreaId) => (role.permissions[a][act] ? <Icon icon={Check} size={16} strokeWidth={1.5} aria-label="Allowed" /> : <span aria-label="Not allowed">–</span>),
          })),
        ]}
      />
      {role.builtIn && (
        <Alert tone="info" title="Built-in roles cannot be edited">
          Duplicate it as a custom role to change what it can do.
        </Alert>
      )}
      <ModalActions>
        <Button variant="outline" block onClick={onClose}>Close</Button>
        <Button block onClick={() => router.push(`${ROUTES.createRole}?from=${role.id}`)}>Duplicate as custom role</Button>
      </ModalActions>
    </Modal>
  );
}
