"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Modal, ModalActions } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { TextField } from "@/components/ui/TextField";
import { ALERT_GROUPS, type AlertGroup, type Recipient } from "@/data/alerts";
import { validateRecipientEmail } from "@/services/alerts";

/** "Add recipient" pop-up; in edit mode the address is fixed and no consent mail is sent. */
export function RecipientModal({ open, recipient, onClose, onSubmit }: { open: boolean; recipient?: Recipient; onClose: () => void; onSubmit: (v: { name: string; email: string; group: AlertGroup }) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [group, setGroup] = useState<AlertGroup>("Settlements and payouts");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; consent?: string }>({});
  useEffect(() => {
    if (!open) return;
    setName(recipient?.name ?? "");
    setEmail(recipient?.email ?? "");
    setGroup(recipient?.group ?? "Settlements and payouts");
    setConsent(!!recipient);
    setErrors({});
  }, [open, recipient]);

  const submit = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "Enter their full name";
    if (!recipient) {
      const em = validateRecipientEmail(email);
      if (em) e.email = em;
      if (!consent) e.consent = "Confirm they agreed to get alerts";
    }
    setErrors(e);
    if (!Object.keys(e).length) onSubmit({ name, email, group });
  };

  return (
    <Modal open={open} onClose={onClose} width={364} title={recipient ? "Edit recipient" : "Add recipient"} description="They get payment and settlement alerts by email." testId="recipient-modal">
      <TextField label="Full name" placeholder="Enter full name" autoComplete="name" containerClassName="w-full" value={name} error={errors.name} onChange={(e) => { setName(e.target.value); setErrors((x) => ({ ...x, name: undefined })); }} />
      <TextField label="Email address" type="email" placeholder="name@company.in" disabled={!!recipient} containerClassName="w-full" value={email} error={errors.email} onChange={(e) => { setEmail(e.target.value); setErrors((x) => ({ ...x, email: undefined })); }} />
      <Select label="Alert group" containerClassName="w-full" value={group} onChange={(e) => setGroup(e.target.value as AlertGroup)} options={ALERT_GROUPS.map((g) => ({ value: g, label: g }))} />
      {!recipient && (
        <div className="flex flex-col gap-1.5">
          <Checkbox checked={consent} onChange={(v) => { setConsent(v); setErrors((x) => ({ ...x, consent: undefined })); }} label="They agreed to get these alerts" />
          {errors.consent && <p className="type-12r text-error">{errors.consent}</p>}
        </div>
      )}
      <ModalActions>
        <Button variant="outline" block onClick={onClose}>Cancel</Button>
        <Button block onClick={submit}>{recipient ? "Save changes" : "Send consent mail"}</Button>
      </ModalActions>
    </Modal>
  );
}

export function FixBouncedModal({ open, recipient, onClose, onSubmit }: { open: boolean; recipient?: Recipient; onClose: () => void; onSubmit: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!open || !recipient) return;
    setEmail(recipient.email);
    setError(null);
  }, [open, recipient]);
  if (!recipient) return null;
  return (
    <Modal open={open} onClose={onClose} width={364} title="Fix recipient email" description="The last email to this address bounced." testId="fix-bounced-modal">
      <TextField label="Email" type="email" placeholder="finance@sharmatextiles.in" containerClassName="w-full" value={email} error={error} onChange={(e) => { setEmail(e.target.value); setError(null); }} />
      <ModalActions>
        <Button variant="outline" block onClick={onClose}>Cancel</Button>
        <Button
          block
          onClick={() => {
            const e = validateRecipientEmail(email, recipient.id);
            if (e) return setError(e);
            onSubmit(email);
          }}
        >
          Save and resend
        </Button>
      </ModalActions>
    </Modal>
  );
}
