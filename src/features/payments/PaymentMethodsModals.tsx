"use client";

import { useEffect, useRef, useState } from "react";
import { Paperclip } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { validateUpload } from "@/components/ui/FileDrop";
import { Icon } from "@/components/ui/Icon";
import { Modal, ModalActions } from "@/components/ui/Modal";
import { TextArea, TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/Toast";
import type { LimitRow, PaymentMethodRow } from "@/data/payments";
import { cancelLimitRequest, formatRupeeInput, parseRupees, requestLimitIncrease, requestMethodAccess, startInternationalCards, validateLimitRequest } from "@/services/payments";

export type PaymentsModal = "request-access" | "limit-increase" | "cancel-limit" | "intl-cards";
type Base = { open: boolean; onClose: () => void };

export function RequestAccessModal({ open, onClose, method }: Base & { method: PaymentMethodRow }) {
  const toast = useToast();
  const [useCase, setUseCase] = useState("");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (open) {
      setUseCase("");
      setError(null);
    }
  }, [open]);
  const submit = async () => {
    try {
      await requestMethodAccess(method.id, useCase);
      onClose();
      toast.show("request-submitted");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <Modal open={open} onClose={onClose} width={364} title={`Request ${method.name.toLowerCase()} access`} description="Our team reviews requests in 2 working days." testId="request-access-modal">
      <TextArea label="Business use case" placeholder={`Describe how you will use ${method.name.toLowerCase()}`} containerClassName="w-full" height={96} maxLength={500} value={useCase} onChange={(e) => { setUseCase(e.target.value); setError(null); }} error={error} helper="Shown on your checkout page" />
      <ModalActions>
        <Button variant="outline" block onClick={onClose}>Cancel</Button>
        <Button block onClick={submit}>Submit</Button>
      </ModalActions>
    </Modal>
  );
}

export function LimitIncreaseModal({ open, onClose, limit }: Base & { limit: LimitRow }) {
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ amount?: string; reason?: string; file?: string }>({});
  useEffect(() => {
    if (!open) return;
    setAmount("₹ 60,00,000");
    setReason("");
    setFile(null);
    setErrors({});
  }, [open]);
  const submit = async () => {
    const value = parseRupees(amount);
    const e = validateLimitRequest({ amount: value, reason, current: typeof limit.current === "number" ? limit.current : 0 });
    setErrors(e);
    if (Object.keys(e).length) return;
    await requestLimitIncrease(limit.id, value);
    onClose();
    toast.show("request-submitted");
  };
  return (
    <Modal open={open} onClose={onClose} width={364} title="Request limit increase" description="Our team reviews it within 2 working days." testId="limit-increase-modal">
      <TextField label="Required monthly limit" inputMode="numeric" containerClassName="w-full" value={amount} onChange={(e) => { setAmount(formatRupeeInput(e.target.value)); setErrors((x) => ({ ...x, amount: undefined })); }} error={errors.amount} />
      <TextField label="Why do you need a higher limit?" placeholder="Enter reason" containerClassName="w-full" value={reason} maxLength={200} onChange={(e) => { setReason(e.target.value); setErrors((x) => ({ ...x, reason: undefined })); }} error={errors.reason} />
      <div className="flex w-full flex-col gap-1">
        <button type="button" onClick={() => fileInput.current?.click()} className="flex items-center gap-2 text-left">
          <Icon icon={Paperclip} size={16} className="text-text-primary" />
          <span className="type-14m text-text-primary">{file ? file.name : "Attach document"}</span>
          <span className="type-12r text-text-secondary">{file ? `${(file.size / 1024).toFixed(0)} KB` : "Max 5 MB"}</span>
        </button>
        <input
          ref={fileInput}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="sr-only"
          data-testid="limit-file-input"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const err = validateUpload(f);
            setFile(err ? null : f);
            setErrors((x) => ({ ...x, file: err ?? undefined }));
          }}
        />
        {errors.file && <p className="type-12r text-error">{errors.file}</p>}
      </div>
      <ModalActions>
        <Button variant="outline" block onClick={onClose}>Cancel</Button>
        <Button block onClick={submit}>Submit request</Button>
      </ModalActions>
    </Modal>
  );
}

export function CancelLimitModal({ open, onClose, limit }: Base & { limit: LimitRow }) {
  const toast = useToast();
  return (
    <Modal open={open} onClose={onClose} width={364} title="Cancel limit request?" description="Your current limits stay as they are." testId="cancel-limit-modal">
      <ModalActions>
        <Button variant="outline" block onClick={onClose}>Keep</Button>
        <Button variant="danger" block onClick={async () => { await cancelLimitRequest(limit.id); onClose(); toast.show("request-submitted"); }}>Cancel request</Button>
      </ModalActions>
    </Modal>
  );
}

export function InternationalCardsModal({ open, onClose }: Base) {
  const toast = useToast();
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (open) {
      setAccepted(false);
      setError(false);
    }
  }, [open]);
  return (
    <Modal open={open} onClose={onClose} width={478} title="Enable international cards" description="Accept Visa and Mastercard issued outside India." testId="intl-cards-modal">
      <Alert tone="info" title="Extra documents needed">
        Export licence and invoice samples.
      </Alert>
      <div className="flex flex-col gap-1">
        <Checkbox checked={accepted} onChange={(v) => { setAccepted(v); setError(false); }} label="I accept the international payments terms" />
        {error && <p className="type-12r text-error" role="alert">Accept the terms to continue</p>}
      </div>
      <ModalActions>
        <Button variant="outline" block onClick={onClose}>Cancel</Button>
        <Button block onClick={async () => { if (!accepted) return setError(true); await startInternationalCards(); onClose(); toast.show("request-submitted"); }}>Start</Button>
      </ModalActions>
    </Modal>
  );
}
