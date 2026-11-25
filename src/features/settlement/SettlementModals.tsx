"use client";

import { useEffect, useState } from "react";
import { CircleX, FileText } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { Modal, ModalActions } from "@/components/ui/Modal";
import { OptionCard } from "@/components/ui/OptionCard";
import { TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/Toast";
import { MODAL_SCHEDULES, SCHEDULES, type BankAccount, type ScheduleId } from "@/data/settlement";
import { useStore } from "@/lib/store";
import { addBankAccount, cancelChangeRequest, maskAccount, retryVerification, settlementStore, updateSchedule, validateBankAccount, type NewAccountInput } from "@/services/settlement";

export type SettlementModal = "view-bank" | "cancel-request" | "add-bank" | "cheque" | "fix-retry" | "schedule" | "verify-pause";
type Base = { open: boolean; onClose: () => void };

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-px flex-1 flex-col items-start gap-0.5">
      <p className="type-12r text-text-secondary">{label}</p>
      <p className="type-14m text-text-primary">{value}</p>
    </div>
  );
}

export function ViewBankModal({ open, onClose, account, onChange }: Base & { account: BankAccount; onChange: () => void }) {
  const primary = account.status === "primary";
  return (
    <Modal
      open={open}
      onClose={onClose}
      width={565}
      testId="view-bank-modal"
      title={
        <span className="flex items-center gap-2.5">
          {maskAccount(account)}
          <Chip tone="success">Verified</Chip>
          {primary && <Chip tone="brand">Primary</Chip>}
        </span>
      }
      description="Settlements are paid here every working day."
    >
      <div className="flex w-full flex-col gap-3.5">
        <div className="flex w-full gap-4">
          <Detail label="Account holder" value={account.holder} />
          <Detail label="IFSC" value={account.ifsc} />
        </div>
        <div className="flex w-full gap-4">
          <Detail label="Branch" value={account.branch} />
          <Detail label="Added" value={account.added} />
        </div>
        <div className="flex w-full gap-4">
          <Detail label="Verified by" value={account.verifiedBy ?? "Penny-drop ₹1"} />
          <Detail label="Last settlement" value={account.lastSettlement ?? "—"} />
        </div>
      </div>
      {primary && (
        <Alert tone="info" title="The primary account cannot be removed">
          Add another account and switch to it first.
        </Alert>
      )}
      <ModalActions>
        <Button variant="outline" block onClick={onClose}>Close</Button>
        <Button block onClick={onChange}>Change account</Button>
      </ModalActions>
    </Modal>
  );
}

export function CancelRequestModal({ open, onClose }: Base) {
  const s = useStore(settlementStore);
  const toast = useToast();
  const req = s.request;
  const acc = req ? s.accounts.find((a) => a.id === req.accountId) : undefined;
  const rows = req && acc ? [["Request", req.id], ["New account", `${acc.bank.split(" ")[0]} ••${acc.last4}`], ["Submitted", req.submittedOn]] : [];
  return (
    <Modal open={open && !!req} onClose={onClose} width={478} title="Cancel change request?" description="The current settlement account stays active." testId="cancel-request-modal">
      <dl className="flex w-full flex-col gap-2 rounded-2xl bg-container p-3">
        {rows.map(([k, v]) => (
          <div key={k} className="flex w-full items-center justify-between">
            <dt className="type-12r text-text-secondary">{k}</dt>
            <dd className="type-12m text-text-primary">{v}</dd>
          </div>
        ))}
      </dl>
      <ModalActions>
        <Button variant="outline" block onClick={onClose}>Keep request</Button>
        <Button variant="danger" block onClick={async () => { await cancelChangeRequest(); onClose(); toast.show("request-submitted"); }}>Cancel request</Button>
      </ModalActions>
    </Modal>
  );
}

export function AddBankModal({ open, onClose }: Base) {
  const toast = useToast();
  const [form, setForm] = useState<NewAccountInput>({ holder: "", accountNumber: "", ifsc: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof NewAccountInput, string>>>({});
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!open) return;
    setForm({ holder: "", accountNumber: "", ifsc: "" });
    setErrors({});
  }, [open]);
  const bind = (k: keyof NewAccountInput) => ({
    value: form[k],
    error: errors[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [k]: k === "ifsc" ? e.target.value.toUpperCase() : k === "accountNumber" ? e.target.value.replace(/[^\d]/g, "") : e.target.value }));
      setErrors((er) => ({ ...er, [k]: undefined }));
    },
  });
  const submit = async () => {
    const e = validateBankAccount(form);
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    await addBankAccount(form);
    setBusy(false);
    onClose();
    toast.show("request-submitted");
  };
  return (
    <Modal open={open} onClose={onClose} width={364} title="Add a bank account" description="Step 1 of 3 · Account details" testId="add-bank-modal">
      <TextField label="Account holder name" placeholder="As on bank records" containerClassName="w-full" autoComplete="name" {...bind("holder")} />
      <TextField label="Account number" placeholder="Enter account number" inputMode="numeric" containerClassName="w-full" maxLength={18} {...bind("accountNumber")} />
      <TextField label="IFSC code" placeholder="For example, ICIC0001234" containerClassName="w-full" maxLength={11} {...bind("ifsc")} />
      <p className="type-12r text-text-secondary">We send ₹1 to check the account. It comes straight back to you.</p>
      <ModalActions>
        <Button variant="outline" block onClick={onClose}>Cancel</Button>
        <Button block onClick={submit} disabled={busy}>Verify account</Button>
      </ModalActions>
    </Modal>
  );
}

export function ViewChequeModal({ open, onClose, account }: Base & { account: BankAccount }) {
  const toast = useToast();
  const cheque = account.cheque ?? { file: "cheque.jpg", uploaded: account.added };
  return (
    <Modal open={open} onClose={onClose} width={565} title="Cancelled cheque" description={`${account.bank.split(" ")[0].toUpperCase()} ••${account.last4} · Uploaded ${cheque.uploaded}`} testId="view-cheque-modal">
      <div className="flex w-full flex-col items-center gap-2 rounded-2xl bg-container p-5">
        <Icon icon={FileText} size={28} className="text-text-secondary" />
        <p className="type-12r text-text-secondary">{cheque.file}</p>
      </div>
      <ModalActions>
        <Button variant="outline" block onClick={onClose}>Close</Button>
        <Button block onClick={() => { onClose(); toast.show("download-started"); }}>Download</Button>
      </ModalActions>
    </Modal>
  );
}

export function FixRetryModal({ open, onClose, account }: Base & { account: BankAccount }) {
  const toast = useToast();
  const [accountNumber, setAccountNumber] = useState(account.accountNumber);
  const [ifsc, setIfsc] = useState(account.ifsc);
  const [errors, setErrors] = useState<Partial<Record<"accountNumber" | "ifsc", string>>>({});
  const [showAlert, setShowAlert] = useState(true);
  useEffect(() => {
    if (!open) return;
    setAccountNumber(account.accountNumber);
    setIfsc(account.ifsc);
    setErrors({});
    setShowAlert(true);
  }, [open, account]);
  const submit = async () => {
    const e = validateBankAccount({ holder: account.holder, accountNumber, ifsc }, false);
    setErrors(e);
    if (Object.keys(e).length) return;
    await retryVerification(account.id, { accountNumber, ifsc });
    onClose();
    toast.show("request-submitted");
  };
  return (
    <Modal open={open} onClose={onClose} width={478} title="Fix bank account" description="Penny-drop failed. Check the details and retry." testId="fix-retry-modal">
      {showAlert && account.status === "mismatch" && (
        <Alert tone="error" icon={CircleX} title="Name mismatch" onDismiss={() => setShowAlert(false)}>
          Account holder name does not match your business name.
        </Alert>
      )}
      <TextField label="Account number" inputMode="numeric" containerClassName="w-full" maxLength={18} value={accountNumber} error={errors.accountNumber} onChange={(e) => { setAccountNumber(e.target.value.replace(/[^\d]/g, "")); setErrors((x) => ({ ...x, accountNumber: undefined })); }} />
      <TextField label="IFSC" containerClassName="w-full" maxLength={11} value={ifsc} error={errors.ifsc} onChange={(e) => { setIfsc(e.target.value.toUpperCase()); setErrors((x) => ({ ...x, ifsc: undefined })); }} />
      <ModalActions>
        <Button variant="outline" block onClick={onClose}>Cancel</Button>
        <Button block onClick={submit}>Verify again</Button>
      </ModalActions>
    </Modal>
  );
}

export function EditScheduleModal({ open, onClose, preset }: Base & { preset: ScheduleId | null }) {
  const s = useStore(settlementStore);
  const toast = useToast();
  const [choice, setChoice] = useState<ScheduleId>(s.schedule);
  useEffect(() => {
    if (open) setChoice(preset ?? s.schedule);
  }, [open, preset, s.schedule]);
  const options = Array.from(new Set([...MODAL_SCHEDULES, s.schedule, ...(preset ? [preset] : [])]));
  return (
    <Modal open={open} onClose={onClose} width={364} title="Edit settlement schedule" description="Choose when captured payments reach your bank." testId="edit-schedule-modal">
      <div role="radiogroup" aria-label="Settlement schedule" className="flex w-full flex-col gap-4">
        {options.map((id) => {
          return <OptionCard key={id} name="edit-schedule" checked={choice === id} onSelect={() => setChoice(id)} title={SCHEDULES[id].title} hint={SCHEDULES[id].hint} />;
        })}
      </div>
      <Alert tone="info" title="Starts next cycle">
        The change applies from tomorrow.
      </Alert>
      <ModalActions>
        <Button variant="outline" block onClick={onClose}>Cancel</Button>
        <Button block onClick={async () => { await updateSchedule(choice); onClose(); toast.show("changes-saved"); }}>Save schedule</Button>
      </ModalActions>
    </Modal>
  );
}
