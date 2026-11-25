"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Modal, ModalActions } from "@/components/ui/Modal";
import { OptionCard } from "@/components/ui/OptionCard";
import { TextField } from "@/components/ui/TextField";
import { newVerifyToken, validateDomain } from "@/services/domains";

export function AddDomainModal({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (name: string, token: string) => void }) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState("pw-verify=9f2c41ab77");
  useEffect(() => {
    if (!open) return;
    setName("");
    setError(null);
    setToken(newVerifyToken());
  }, [open]);
  return (
    <Modal open={open} onClose={onClose} width={478} title="Add a domain" description="Prove you own it with one DNS record." testId="add-domain-modal">
      <TextField label="Domain" placeholder="checkout.sharmatextiles.in" autoCapitalize="none" spellCheck={false} containerClassName="w-full" value={name} error={error} onChange={(e) => { setName(e.target.value); setError(null); }} />
      <OptionCard name="verify-method" checked onSelect={() => undefined} title="DNS TXT record" hint="Recommended. Works for every site." />
      <DataTable
        headerTone="container"
        rowHeight={40}
        caption="DNS record to add"
        rows={[{ type: "TXT", name: "_paywize", value: token }]}
        rowKey={(r) => r.type}
        columns={[
          { key: "type", header: "Type", width: 70, render: (r) => r.type },
          { key: "name", header: "Name", width: 130, render: (r) => r.name },
          { key: "value", header: "Value", render: (r) => r.value },
        ]}
      />
      <Alert tone="info" title="Can take up to 24 hours">
        We check again every hour.
      </Alert>
      <ModalActions>
        <Button variant="outline" block onClick={onClose}>Cancel</Button>
        <Button
          block
          onClick={() => {
            const e = validateDomain(name);
            if (e) return setError(e);
            onSubmit(name, token);
          }}
        >
          Verify domain
        </Button>
      </ModalActions>
    </Modal>
  );
}

export function RemoveDomainModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal open={open} onClose={onClose} width={364} title="Remove domain?" description="Checkout will stop working on this domain." testId="remove-domain-modal">
      <ModalActions>
        <Button variant="outline" block onClick={onClose}>Keep</Button>
        <Button variant="danger" block onClick={onConfirm}>Remove</Button>
      </ModalActions>
    </Modal>
  );
}
