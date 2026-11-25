"use client";

import { useEffect, useId, useState } from "react";
import { Check, Lock } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Chip } from "@/components/ui/Chip";
import { CopyButton } from "@/components/ui/CopyButton";
import { DataTable } from "@/components/ui/DataTable";
import { Icon } from "@/components/ui/Icon";
import { Modal, ModalActions, ModalShell } from "@/components/ui/Modal";
import { OptionCard } from "@/components/ui/OptionCard";
import { TextField } from "@/components/ui/TextField";
import type { ApiKey, KeyMode } from "@/data/apiKeys";
import { keyStatus, maskSecret } from "@/services/apiKeys";

export function GenerateKeyModal({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (name: string, mode: KeyMode) => void }) {
  const [name, setName] = useState("");
  const [mode, setMode] = useState<KeyMode>("live");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    setName("");
    setMode("live");
    setError(null);
  }, [open]);
  return (
    <Modal open={open} onClose={onClose} width={364} title="Generate new key pair" description="The secret is shown once, so keep it safe." testId="generate-key-modal">
      <TextField label="Key name" placeholder="For example, Production server" maxLength={40} containerClassName="w-full" value={name} error={error} onChange={(e) => { setName(e.target.value); setError(null); }} />
      <p className="type-12sb text-text-primary">Mode</p>
      <div role="radiogroup" aria-label="Mode" className="flex w-full flex-col gap-4">
        <OptionCard name="key-mode" checked={mode === "live"} onSelect={() => setMode("live")} title="Live" hint="Moves real money" />
        <OptionCard name="key-mode" checked={mode === "test"} onSelect={() => setMode("test")} title="Test" hint="Sandbox only" />
      </div>
      {mode === "live" && (
        <Alert tone="warning" title="Live keys need a code">
          We text a 6-digit code before creating one.
        </Alert>
      )}
      <ModalActions>
        <Button variant="outline" block onClick={onClose}>Cancel</Button>
        <Button
          block
          onClick={() => {
            if (!name.trim()) return setError("Enter a name for this key");
            onSubmit(name, mode);
          }}
        >
          Generate
        </Button>
      </ModalActions>
    </Modal>
  );
}

function SecretRow({ label, value, display }: { label: string; value: string; display: string }) {
  return (
    <div className="flex w-full items-center gap-3 rounded-2xl bg-container px-3.5 py-2.5">
      <Icon icon={Lock} size={20} className="text-text-secondary" />
      <div className="flex min-w-px flex-1 flex-col gap-0.5">
        <p className="type-12r text-text-secondary">{label}</p>
        <p className="type-14m truncate text-text-primary">{display}</p>
      </div>
      <CopyButton value={value} label={label.toLowerCase()} size={18} />
    </div>
  );
}

/** "Key pair generated": no ×, Done only once the secret is saved. */
export function KeyGeneratedModal({ open, keyId, secret, mode, onDone }: { open: boolean; keyId: string; secret?: string; mode: KeyMode; onDone: () => void }) {
  const [saved, setSaved] = useState(false);
  const titleId = useId();
  useEffect(() => {
    if (open) setSaved(false);
  }, [open]);
  return (
    <ModalShell open={open} onClose={() => saved && onDone()} width={478} labelledBy={titleId} testId="key-generated-modal" className="gap-4 p-5">
      <div className="flex w-full flex-col items-center gap-3 pt-2">
        <span className="flex size-14 items-center justify-center rounded-full bg-success-container text-success">
          <Icon icon={Check} size={28} />
        </span>
        <h2 id={titleId} className="type-18sb text-text-primary">Key pair generated</h2>
        <p className="type-12r text-center text-text-secondary">{secret ? "Copy the secret now. We show it only once." : "The secret was shown once and is now hidden."}</p>
      </div>
      <SecretRow label="Key ID" value={keyId} display={keyId} />
      {secret && <SecretRow label="Secret key" value={secret} display={maskSecret(mode)} />}
      <Checkbox checked={saved} onChange={setSaved} label="I have saved the secret in a safe place" />
      <ModalActions>
        <Button block disabled={!saved} onClick={onDone}>Done</Button>
      </ModalActions>
    </ModalShell>
  );
}

export function RegenerateKeyModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal open={open} onClose={onClose} width={478} title="Regenerate key pair" description="The old pair stops working at once." testId="regenerate-key-modal">
      <Alert tone="warning" title="Update your servers first">
        Requests signed with the old key will fail.
      </Alert>
      <ModalActions>
        <Button variant="outline" block onClick={onClose}>Cancel</Button>
        <Button variant="danger" block onClick={onConfirm}>Regenerate</Button>
      </ModalActions>
    </Modal>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-px flex-1 flex-col gap-0.5">
      <p className="type-12r text-text-secondary">{label}</p>
      <p className="type-14m text-text-primary">{value}</p>
    </div>
  );
}

export function ViewKeyModal({ open, apiKey, ipRule, onClose, onRevoke, onRegenerate }: { open: boolean; apiKey?: ApiKey; ipRule: string; onClose: () => void; onRevoke: () => void; onRegenerate: () => void }) {
  if (!apiKey) return null;
  const status = keyStatus(apiKey);
  return (
    <Modal
      open={open}
      onClose={onClose}
      width={565}
      testId="view-key-modal"
      title={
        <span className="flex items-center gap-2.5">
          {apiKey.id}
          <Chip tone={status.tone}>{status.label}</Chip>
        </span>
      }
      description={`${apiKey.mode === "live" ? "Live" : "Test"} key · created ${apiKey.createdAt} by ${apiKey.createdBy}`}
    >
      <div className="flex w-full flex-col gap-3.5">
        <div className="flex w-full gap-4">
          <Detail label="Mode" value={apiKey.mode === "live" ? "Live" : "Test"} />
          <Detail label="Last used" value={apiKey.lastUsed} />
        </div>
        <div className="flex w-full gap-4">
          <Detail label="Secret" value="Hidden · a code is needed to reveal" />
          <Detail label="IP rule" value={ipRule} />
        </div>
      </div>
      <p className="type-12sb text-text-primary">Recent calls</p>
      {apiKey.calls.length ? (
        <DataTable
          headerTone="container"
          rowHeight={40}
          caption="Recent calls"
          rows={apiKey.calls}
          rowKey={(c) => c.at + c.request}
          columns={[
            { key: "at", header: "Time", width: 130, render: (c) => c.at },
            { key: "req", header: "Request", render: (c) => c.request },
            { key: "res", header: "Result", width: 90, render: (c) => c.result },
          ]}
        />
      ) : (
        <p className="type-12r text-text-secondary">No calls yet.</p>
      )}
      <ModalActions>
        <Button variant="outline" block onClick={onRevoke}>Revoke key</Button>
        <Button block onClick={onRegenerate}>Regenerate</Button>
      </ModalActions>
    </Modal>
  );
}

export function RevokeKeyModal({ open, apiKey, onClose, onConfirm }: { open: boolean; apiKey?: ApiKey; onClose: () => void; onConfirm: () => void }) {
  const [ack, setAck] = useState(false);
  useEffect(() => {
    if (open) setAck(false);
  }, [open]);
  if (!apiKey) return null;
  return (
    <Modal open={open} onClose={onClose} width={478} title="Revoke this key?" description="Calls that use it start failing straight away." testId="revoke-key-modal">
      <Alert tone="warning" title="This cannot be undone">
        {apiKey.servers > 0 ? `${apiKey.id} was used by ${apiKey.servers} ${apiKey.servers === 1 ? "server" : "servers"} in the last 24 hours.` : `${apiKey.id} has not been used in the last 24 hours.`}
      </Alert>
      <Checkbox checked={ack} onChange={setAck} label="I understand, revoke this key" />
      <ModalActions>
        <Button variant="outline" block onClick={onClose}>Cancel</Button>
        <Button variant="danger" block disabled={!ack} onClick={onConfirm}>Revoke key</Button>
      </ModalActions>
    </Modal>
  );
}

export function RemoveIpModal({ open, ip, onClose, onConfirm }: { open: boolean; ip?: string; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal open={open && !!ip} onClose={onClose} width={364} title="Remove IP address?" description={`Calls from ${ip} will be blocked.`} testId="remove-ip-modal">
      <ModalActions>
        <Button variant="outline" block onClick={onClose}>Keep</Button>
        <Button variant="danger" block onClick={onConfirm}>Remove</Button>
      </ModalActions>
    </Modal>
  );
}

export function AddIpModal({ open, initialIp, validate, onClose, onSubmit }: { open: boolean; initialIp: string; validate: (ip: string) => string | null; onClose: () => void; onSubmit: (ip: string, label: string) => void }) {
  const [ip, setIp] = useState("");
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    setIp(initialIp);
    setLabel("");
    setError(null);
  }, [open, initialIp]);
  return (
    <Modal open={open} onClose={onClose} width={364} title="Add IP address" description="Only listed IPs can call the API." testId="add-ip-modal">
      <TextField label="IP address" placeholder="203.0.113.10" inputMode="decimal" containerClassName="w-full" value={ip} error={error} onChange={(e) => { setIp(e.target.value); setError(null); }} />
      <TextField label="Label (optional)" placeholder="Production server" maxLength={40} containerClassName="w-full" value={label} onChange={(e) => setLabel(e.target.value)} />
      <ModalActions>
        <Button variant="outline" block onClick={onClose}>Cancel</Button>
        <Button
          block
          onClick={() => {
            const e = validate(ip);
            if (e) return setError(e);
            onSubmit(ip, label);
          }}
        >
          Add IP
        </Button>
      </ModalActions>
    </Modal>
  );
}
