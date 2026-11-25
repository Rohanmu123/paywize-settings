"use client";

import { useState } from "react";
import { Link as LinkIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ServiceScope, scopeStore } from "@/components/layout/ServiceScope";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { CopyButton } from "@/components/ui/CopyButton";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Switch } from "@/components/ui/Switch";
import { TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/Toast";
import type { Domain, ReturnUrls } from "@/data/domains";
import { useStore } from "@/lib/store";
import { useModal } from "@/lib/useModal";
import { addDomain, checkDomain, domainsStore, removeDomain, saveReturnUrl, setAllowIframe, validateReturnUrl } from "@/services/domains";
import { AddDomainModal, RemoveDomainModal } from "./DomainsModals";

const URL_FIELDS: { key: keyof ReturnUrls; label: string; helper?: string; optional?: boolean }[] = [
  { key: "success", label: "Success URL" },
  { key: "failure", label: "Failure URL" },
  { key: "cancel", label: "Cancel URL", helper: "Optional. We use the success URL if left empty.", optional: true },
];

function ToggleRow({ title, chip, hint, children }: { title: string; chip?: React.ReactNode; hint: string; children: React.ReactNode }) {
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <p className="type-14sb text-text-primary">{title}</p>
          {chip}
        </div>
        <p className="type-12r text-text-secondary">{hint}</p>
      </div>
      {children}
    </div>
  );
}

export function DomainsView() {
  const { domains, urls, allowIframe } = useStore(domainsStore);
  const scope = useStore(scopeStore);
  const toast = useToast();
  const modal = useModal<"add-domain" | "remove-domain">();
  const [draft, setDraft] = useState<ReturnUrls>({ ...urls, cancel: urls.cancel || "" });
  const [errors, setErrors] = useState<Partial<Record<keyof ReturnUrls, string | null>>>(() => ({ failure: validateReturnUrl(urls.failure) }));
  const [checking, setChecking] = useState<string | null>(null);
  const [showDns, setShowDns] = useState(true);

  const pending = domains.filter((d) => d.status === "pending");

  const cols: Column<Domain>[] = [
    { key: "name", header: "Domain", render: (d) => d.name },
    { key: "mode", header: "Mode", width: 90, render: (d) => <Chip variant="outline" tone={d.mode === "live" ? "success" : "info"}>{d.mode === "live" ? "Live" : "Test"}</Chip> },
    { key: "status", header: "Status", width: 150, render: (d) => (d.status === "verified" ? <Chip tone="success">Verified</Chip> : <Chip tone="warning">DNS pending</Chip>) },
    {
      key: "action",
      header: "",
      width: 110,
      align: "right",
      render: (d) =>
        d.status === "pending" ? (
          <button
            type="button"
            disabled={checking === d.id}
            className="type-12sb cursor-pointer whitespace-nowrap text-primary hover:underline disabled:cursor-wait disabled:opacity-60"
            onClick={async () => {
              setChecking(d.id);
              await checkDomain(d.id);
              setChecking(null);
              toast.show("changes-saved");
            }}
          >
            {checking === d.id ? "Checking…" : "Check now"}
          </button>
        ) : (
          <button type="button" className="type-12m cursor-pointer whitespace-nowrap text-error hover:underline" onClick={() => modal.open("remove-domain", d.id)}>
            Remove
          </button>
        ),
    },
  ];

  const commit = async (key: keyof ReturnUrls, optional?: boolean) => {
    const value = draft[key];
    const err = validateReturnUrl(value, optional);
    setErrors((e) => ({ ...e, [key]: err }));
    if (err) return;
    const normalised = value.trim() === "https://" ? "" : value.trim();
    if (normalised === urls[key]) return;
    await saveReturnUrl(key, value);
    toast.show("changes-saved");
  };

  return (
    <>
      <PageHeader title="Domains & URLs" actions={<ServiceScope />} />

      <Card aria-label="Allowed domains">
        <CardHeader icon={LinkIcon} title="Allowed domains" action={<Button size="sm" onClick={() => modal.open("add-domain")}>Add domain</Button>} />
        <DataTable columns={cols} rows={domains} rowKey={(d) => d.id} caption="Allowed domains" />
        {pending.map((d) => {
          const record = `TXT  _paywize.${d.name}  →  ${d.token}`;
          return (
            <div key={d.id} className="flex h-11 w-full items-center gap-2.5 overflow-clip rounded-[10px] bg-surface-variant px-3.5">
              <p className="type-14m min-w-px flex-1 truncate whitespace-pre text-text-secondary">{record}</p>
              <CopyButton value={d.token} label={`TXT record for ${d.name}`} />
            </div>
          );
        })}
        {showDns && pending.length > 0 && (
          <Alert tone="warning" title="Waiting for your DNS record" onDismiss={() => setShowDns(false)}>
            Add the TXT record above at your domain provider. It can take up to 24 hours to show up. Checkout is blocked on {pending.map((d) => d.name).join(", ")} until then.
          </Alert>
        )}
      </Card>

      <Card aria-label="Return URLs">
        <CardHeader icon={LinkIcon} title="Return URLs" />
        <div className="flex w-full flex-col gap-3">
          <div className="flex w-full items-start gap-4">
            {URL_FIELDS.slice(0, 2).map((f) => (
              <TextField
                key={f.key}
                label={f.label}
                type="url"
                inputMode="url"
                placeholder="https://"
                containerClassName="min-w-px flex-1"
                value={draft[f.key]}
                error={errors[f.key] ?? undefined}
                helper={"​"}
                onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                onBlur={() => commit(f.key)}
              />
            ))}
          </div>
          {URL_FIELDS.slice(2).map((f) => (
            <TextField
              key={f.key}
              label={f.label}
              type="url"
              inputMode="url"
              placeholder="https://"
              containerClassName="w-full"
              value={draft[f.key]}
              error={errors[f.key] ?? undefined}
              helper={f.helper}
              onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
              onBlur={() => commit(f.key, f.optional)}
            />
          ))}
          <div className="h-px w-full bg-border-variant" />
          <ToggleRow title="Require HTTPS in live mode" chip={<Chip tone="neutral">Always on</Chip>} hint="Rejects redirects and webhooks to http addresses.">
            <Switch aria-label="Require HTTPS in live mode" checked locked onChange={() => undefined} />
          </ToggleRow>
          <ToggleRow title="Allow checkout inside an iframe" hint="Only for your verified domains. Some banks may not load.">
            <Switch
              aria-label="Allow checkout inside an iframe"
              checked={allowIframe}
              onChange={async (v) => {
                await setAllowIframe(v);
                toast.show("changes-saved");
              }}
            />
          </ToggleRow>
        </div>
      </Card>

      <AddDomainModal
        open={modal.is("add-domain")}
        onClose={modal.close}
        onSubmit={async (name, token) => {
          await addDomain(name, scope.testMode ? "test" : "live", token);
          setShowDns(true);
          modal.close();
          toast.show("request-submitted");
        }}
      />
      <RemoveDomainModal
        open={modal.is("remove-domain") && domains.some((d) => d.id === modal.target)}
        onClose={modal.close}
        onConfirm={async () => {
          if (modal.target) await removeDomain(modal.target);
          modal.close();
          toast.show("changes-saved");
        }}
      />
    </>
  );
}
