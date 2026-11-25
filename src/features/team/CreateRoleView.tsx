"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ListChecks, Lock, Shield } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SaveBar } from "@/components/layout/SaveBar";
import { Alert } from "@/components/ui/Alert";
import { Card, CardHeader } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Chip } from "@/components/ui/Chip";
import { DataTable } from "@/components/ui/DataTable";
import { Select } from "@/components/ui/Select";
import { TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/Toast";
import { ACTIONS, CUSTOM_ROLE_DRAFT, NOT_APPLICABLE, PERMISSION_AREAS, ROLE_DESCRIPTION_MAX, type Action, type AreaId, type PermissionSet, type ServiceId, type ServiceMode } from "@/data/team";
import { ROUTES } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { countPermissions, createRole, roleById, rolesStore, templatePermissions } from "@/services/team";
import { ServiceAccessTable } from "./ServiceAccessTable";

const HEADERS: Record<Action, string> = { view: "View", create: "Create", edit: "Edit", approve: "Delete or approve" };

export function roleSaveBarMessage(permissions: number, services: number) {
  return `Unsaved role · ${permissions} permission${permissions === 1 ? "" : "s"} · ${services} service${services === 1 ? "" : "s"} · saving asks for a code`;
}

export function CreateRoleView() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const roles = useStore(rolesStore);
  const from = params.get("from");
  const fromRole = from ? roleById(roles, from) : undefined;

  const [name, setName] = useState(fromRole ? `${fromRole.name} (copy)` : CUSTOM_ROLE_DRAFT.name);
  const [template, setTemplate] = useState(fromRole?.id ?? CUSTOM_ROLE_DRAFT.template);
  const [description, setDescription] = useState(CUSTOM_ROLE_DRAFT.description);
  const [perms, setPerms] = useState<PermissionSet>(() => templatePermissions(roles, fromRole?.id ?? CUSTOM_ROLE_DRAFT.template));
  const [access, setAccess] = useState<Record<ServiceId, ServiceMode>>(() =>
    fromRole ? { gateway: fromRole.services.includes("gateway") ? "live-test" : "none", links: fromRole.services.includes("links") ? "live-test" : "none", payouts: fromRole.services.includes("payouts") ? "live-test" : "none" } : { ...CUSTOM_ROLE_DRAFT.access },
  );
  const [nameError, setNameError] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(true);
  const [saving, setSaving] = useState(false);

  const permissionCount = useMemo(() => countPermissions(perms), [perms]);
  const serviceCount = Object.values(access).filter((m) => m !== "none").length;

  const applyTemplate = (id: string) => {
    setTemplate(id);
    setPerms(id === "blank" ? (Object.fromEntries(PERMISSION_AREAS.map((a) => [a.id, { view: false, create: false, edit: false, approve: false }])) as PermissionSet) : templatePermissions(roles, id));
  };

  const toggle = (area: AreaId, action: Action, on: boolean) => setPerms((p) => ({ ...p, [area]: { ...p[area], [action]: on } }));

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed) return setNameError("Give the role a name");
    if (roles.some((r) => r.name.toLowerCase() === trimmed.toLowerCase())) return setNameError("A role with this name already exists");
    setSaving(true);
    await createRole({ name: trimmed, description, permissions: perms, access });
    toast.show("changes-saved");
    router.push(ROUTES.team);
  };

  return (
    <>
      <PageHeader title="Create custom role" subtitle="· Choose what this role can see and change" backHref={ROUTES.team} scope="Applies to every service" />

      <Card aria-label="Role details">
        <CardHeader icon={Shield} title="Role details" />
        <div className="flex w-full items-start gap-4">
          <TextField label="Role name" value={name} onChange={(e) => { setName(e.target.value); setNameError(null); }} error={nameError} maxLength={40} />
          <Select
            label="Start from a template"
            value={template}
            onChange={(e) => applyTemplate(e.target.value)}
            options={[...roles.filter((r) => r.builtIn).map((r) => ({ value: r.id, label: `${r.name} (copy permissions)` })), { value: "blank", label: "Blank role" }]}
          />
        </div>
        <TextField label="Description" containerClassName="w-full" value={description} maxLength={ROLE_DESCRIPTION_MAX} onChange={(e) => setDescription(e.target.value)} helper={`${description.length} of ${ROLE_DESCRIPTION_MAX} characters`} />
      </Card>

      <Card aria-label="Permissions">
        <CardHeader icon={ListChecks} title="Permissions" />
        <DataTable
          caption="Role permissions"
          rows={[...PERMISSION_AREAS]}
          rowKey={(a) => a.id}
          columns={[
            {
              key: "area",
              header: "Area",
              render: (a) => (
                <span className="flex items-center gap-2">
                  {a.label}
                  {a.needsCode && <Chip tone="warning">Needs code</Chip>}
                </span>
              ),
            },
            ...ACTIONS.map((act) => ({
              key: act,
              header: <span className="block whitespace-normal">{HEADERS[act]}</span>,
              width: 125,
              render: (a: (typeof PERMISSION_AREAS)[number]) => {
                const na = NOT_APPLICABLE[a.id]?.includes(act);
                return <Checkbox aria-label={`${a.label}: ${HEADERS[act]}`} checked={!na && perms[a.id][act]} disabled={na} onChange={(on) => toggle(a.id, act, on)} />;
              },
            })),
          ]}
        />
        {showAlert && perms.refunds.create && (
          <Alert tone="warning" title="Refunds move real money" onDismiss={() => setShowAlert(false)}>
            Anyone with this role can refund up to the daily limit. Keep Delete or approve off for a second check.
          </Alert>
        )}
      </Card>

      <Card aria-label="Service and mode access">
        <CardHeader icon={Lock} title="Service and mode access" />
        <ServiceAccessTable value={access} onChange={setAccess} />
      </Card>

      <SaveBar message={roleSaveBarMessage(permissionCount, serviceCount)} discardLabel="Cancel" saveLabel="Save role" onDiscard={() => router.push(ROUTES.team)} onSave={save} saveDisabled={saving} />
    </>
  );
}
