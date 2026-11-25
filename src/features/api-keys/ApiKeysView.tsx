"use client";

import { useState } from "react";
import { Eye, Key } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ServiceScope, scopeStore } from "@/components/layout/ServiceScope";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { CopyButton } from "@/components/ui/CopyButton";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { FilterChip } from "@/components/ui/FilterChip";
import { Icon } from "@/components/ui/Icon";
import { OtpModal } from "@/components/ui/OtpModal";
import { Switch } from "@/components/ui/Switch";
import { TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/Toast";
import { KEY_ROLES, type AllowedIp, type ApiKey, type KeyMode } from "@/data/apiKeys";
import { maskMobileDots } from "@/lib/format";
import { useStore } from "@/lib/store";
import { useModal } from "@/lib/useModal";
import { addIp, apiKeysStore, forgetSecret, formatRemaining, generateKey, keyStatus, regenerateKey, removeIp, revokeKey, setEnforceIps, validateIp } from "@/services/apiKeys";
import { securityStore } from "@/services/security";
import { AddIpModal, GenerateKeyModal, KeyGeneratedModal, RegenerateKeyModal, RemoveIpModal, RevokeKeyModal, ViewKeyModal } from "./ApiKeysModals";

type ApiModal = "generate" | "generate-otp" | "generated" | "view" | "regenerate" | "regenerate-otp" | "revoke" | "remove-ip" | "add-ip";

const rowAction = "type-12m cursor-pointer whitespace-nowrap hover:underline";

export function ApiKeysView() {
  const { keys, ips, enforceIps, secrets } = useStore(apiKeysStore);
  const scope = useStore(scopeStore);
  const { mobile } = useStore(securityStore);
  const toast = useToast();
  const modal = useModal<ApiModal>();
  const [tab, setTab] = useState<KeyMode>(scope.testMode ? "test" : "live");
  const [showInfo, setShowInfo] = useState(true);
  const [showExpiry, setShowExpiry] = useState(true);
  const [showLockout, setShowLockout] = useState(true);
  const [draft, setDraft] = useState<{ name: string; mode: KeyMode }>({ name: "", mode: "live" });
  const [ipInput, setIpInput] = useState("");
  const [ipError, setIpError] = useState<string | null>(null);

  const rows = keys.filter((k) => k.mode === tab);
  const target = keys.find((k) => k.id === modal.target);
  const expiring = rows.find((k) => k.expiresInMinutes != null);
  const masked = maskMobileDots(mobile);
  const ipRule = enforceIps ? `Enforced · ${ips.length} ${ips.length === 1 ? "address" : "addresses"}` : "Not enforced";

  const keyCols: Column<ApiKey>[] = [
    {
      key: "id",
      header: "Key ID",
      render: (k) => (
        <span className="flex items-center gap-2">
          {k.id}
          <CopyButton value={k.id} label="key ID" />
        </span>
      ),
    },
    {
      key: "secret",
      header: "Secret",
      width: 190,
      render: (k) =>
        k.expiresInMinutes != null ? (
          <span className="text-text-tertiary">Hidden</span>
        ) : (
          <span className="flex items-center gap-2.5 text-text-tertiary">
            ••••••••••••••
            <button type="button" aria-label={`View ${k.id}`} className="cursor-pointer text-text-secondary hover:text-text-primary" onClick={() => modal.open("view", k.id)}>
              <Icon icon={Eye} size={16} />
            </button>
          </span>
        ),
    },
    { key: "created", header: "Created", width: 120, render: (k) => k.createdAt },
    { key: "used", header: "Last used", width: 100, render: (k) => k.lastUsed },
    {
      key: "status",
      header: "Status",
      width: 129,
      render: (k) => {
        const s = keyStatus(k);
        return <Chip tone={s.tone}>{s.label}</Chip>;
      },
    },
    {
      key: "action",
      header: "",
      width: 98,
      align: "right",
      render: (k) =>
        k.expiresInMinutes != null ? (
          <button type="button" className={`${rowAction} text-error`} onClick={() => modal.open("revoke", k.id)}>Revoke now</button>
        ) : (
          <button type="button" className={`${rowAction} type-12sb text-primary`} onClick={() => modal.open("regenerate", k.id)}>Regenerate</button>
        ),
    },
  ];

  const ipCols: Column<AllowedIp>[] = [
    { key: "ip", header: "IP or range", render: (r) => r.ip },
    { key: "label", header: "Label", width: 200, render: (r) => r.label },
    { key: "by", header: "Added by", width: 140, render: (r) => r.addedBy },
    { key: "action", header: "", width: 80, align: "right", render: (r) => <button type="button" className={`${rowAction} text-error`} onClick={() => modal.open("remove-ip", r.ip)}>Remove</button> },
  ];

  const finishGenerate = async () => {
    const id = await generateKey(draft.name, draft.mode);
    setTab(draft.mode);
    modal.open("generated", id);
  };

  return (
    <>
      <PageHeader title="API keys" actions={<ServiceScope />} />

      {showInfo && (
        <Alert tone="info" title="Live keys are sensitive" onDismiss={() => setShowInfo(false)}>
          Only Owner, Admin and Developer roles can view them, and only after a one-time code. Never put the secret in a mobile app or browser.
        </Alert>
      )}

      <Card aria-label="API keys">
        <CardHeader icon={Key} title={`${tab === "live" ? "Live" : "Test"} API keys`} action={<Button size="sm" onClick={() => modal.open("generate")}>Generate new key pair</Button>} />
        <div role="group" aria-label="Key mode" className="flex gap-2">
          <FilterChip selected={tab === "live"} onClick={() => setTab("live")}>Live keys</FilterChip>
          <FilterChip selected={tab === "test"} onClick={() => setTab("test")}>Test keys</FilterChip>
        </div>
        {rows.length ? <DataTable columns={keyCols} rows={rows} rowKey={(k) => k.id} caption={`${tab} API keys`} /> : <p className="type-12r w-full py-3 text-center text-text-secondary">No {tab} keys yet. Generate one to start.</p>}
        {expiring && showExpiry && (
          <Alert tone="warning" title={`Old key still works for ${formatRemaining(expiring.expiresInMinutes!)}`} onDismiss={() => setShowExpiry(false)}>
            You regenerated on {expiring.regeneratedOn}. Deploy the new key before the old one stops working. Calls with an expired key return 401.
          </Alert>
        )}
      </Card>

      <Card aria-label="Allowed IP addresses">
        <CardHeader
          icon={Key}
          title="Allowed IP addresses"
          action={
            <label className="flex items-center gap-3">
              <Switch aria-label="Enforce IP allow-list" checked={enforceIps} onChange={async (v) => { await setEnforceIps(v); toast.show("changes-saved"); }} />
              <span className="type-14r text-text-primary">Enforce</span>
            </label>
          }
        />
        {ips.length ? <DataTable columns={ipCols} rows={ips} rowKey={(r) => r.ip} caption="Allowed IP addresses" /> : <p className="type-12r w-full py-3 text-center text-text-secondary">No addresses yet. Any IP can call the API.</p>}
        <form
          className="flex w-full items-start gap-3"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            const err = ipInput.trim() ? validateIp(ipInput) : null;
            if (err) return setIpError(err);
            modal.open("add-ip");
          }}
        >
          <TextField label="Add IP address" placeholder="203.0.113.10" inputMode="decimal" containerClassName="min-w-px flex-1" value={ipInput} error={ipError} onChange={(e) => { setIpInput(e.target.value); setIpError(null); }} />
          <Button type="submit" className="mt-5">Add</Button>
        </form>
        {showLockout && (
          <Alert tone="warning" title="Turning this on could lock you out" onDismiss={() => setShowLockout(false)}>
            If your current IP is not on the list, calls from this device will fail. Add it first.
          </Alert>
        )}
      </Card>

      <Card aria-label="Who can see live keys">
        <CardHeader icon={Key} title="Who can see live keys" />
        <div className="flex gap-2">
          {KEY_ROLES.map((r) => (
            <Chip key={r.label} tone={r.tone}>{r.label}</Chip>
          ))}
        </div>
      </Card>

      <GenerateKeyModal
        open={modal.is("generate")}
        onClose={modal.close}
        onSubmit={(name, mode) => {
          setDraft({ name, mode });
          if (mode === "live") modal.open("generate-otp");
          else void (async () => { const id = await generateKey(name, mode); setTab(mode); modal.open("generated", id); })();
        }}
      />
      <OtpModal open={modal.is("generate-otp")} onClose={modal.close} width={478} destination={masked} onVerified={finishGenerate} />
      <KeyGeneratedModal
        open={modal.is("generated") && !!target}
        keyId={target?.id ?? ""}
        mode={target?.mode ?? "live"}
        secret={target ? secrets[target.id] : undefined}
        onDone={() => {
          if (target) forgetSecret(target.id);
          modal.close();
          toast.show("changes-saved");
        }}
      />
      <ViewKeyModal open={modal.is("view")} apiKey={target} ipRule={ipRule} onClose={modal.close} onRevoke={() => modal.open("revoke", target?.id)} onRegenerate={() => modal.open("regenerate", target?.id)} />
      <RegenerateKeyModal open={modal.is("regenerate") && !!target} onClose={modal.close} onConfirm={() => modal.open("regenerate-otp", target?.id)} />
      <OtpModal
        open={modal.is("regenerate-otp") && !!target}
        onClose={modal.close}
        width={478}
        destination={masked}
        verifyVariant="danger"
        onVerified={async () => {
          if (!target) return;
          const id = await regenerateKey(target.id);
          setShowExpiry(true);
          modal.open("generated", id);
        }}
      />
      <RevokeKeyModal
        open={modal.is("revoke")}
        apiKey={target}
        onClose={modal.close}
        onConfirm={async () => {
          if (!target) return;
          await revokeKey(target.id);
          modal.close();
          toast.show("changes-saved");
        }}
      />
      <RemoveIpModal
        open={modal.is("remove-ip")}
        ip={modal.target ?? undefined}
        onClose={modal.close}
        onConfirm={async () => {
          if (modal.target) await removeIp(modal.target);
          modal.close();
          toast.show("changes-saved");
        }}
      />
      <AddIpModal
        open={modal.is("add-ip")}
        initialIp={ipInput.trim()}
        validate={validateIp}
        onClose={modal.close}
        onSubmit={async (ip, label) => {
          await addIp(ip, label);
          setIpInput("");
          modal.close();
          toast.show("changes-saved");
        }}
      />
    </>
  );
}
