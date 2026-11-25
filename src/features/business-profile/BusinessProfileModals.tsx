"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Modal, ModalActions } from "@/components/ui/Modal";
import { OtpModal } from "@/components/ui/OtpModal";
import { Select } from "@/components/ui/Select";
import { TextArea, TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/Toast";
import { BUSINESS_CATEGORIES } from "@/data/business";
import type { BusinessProfile } from "@/data/types";
import { maskMobile } from "@/lib/format";
import type { useModal } from "@/lib/useModal";
import { isEmail, isMobile } from "@/lib/validation";
import { requestAccountClosure, requestOwnershipTransfer, updateBusinessDetails, updateContact } from "@/services/business";

export type BusinessProfileModal =
  | "edit-business"
  | "edit-contact"
  | "verify-contact"
  | "transfer-ownership"
  | "verify-transfer"
  | "close-account"
  | "verify-close";

type Props = { modal: ReturnType<typeof useModal<BusinessProfileModal>>; profile: BusinessProfile };

const truncate = (s: string, n = 30) => (s.length > n ? s.slice(0, n) + "...." : s);

export function BusinessProfileModals({ modal, profile }: Props) {
  const toast = useToast();
  const otpTo = maskMobile(profile.contact.mobile.replace(/765$/, "214"));

  return (
    <>
      <EditBusinessModal open={modal.is("edit-business")} onClose={modal.close} profile={profile} onSaved={() => { modal.close(); toast.show("changes-saved"); }} />
      <EditContactModal open={modal.is("edit-contact")} onClose={modal.close} profile={profile} onNext={() => modal.open("verify-contact")} />
      <OtpModal open={modal.is("verify-contact")} onClose={modal.close} destination={otpTo} onVerified={async () => { await updateContact(pendingContact.value ?? {}); modal.close(); toast.show("changes-saved"); }} />

      <TransferOwnershipModal open={modal.is("transfer-ownership")} onClose={modal.close} onNext={() => modal.open("verify-transfer")} />
      <OtpModal open={modal.is("verify-transfer")} onClose={modal.close} destination={otpTo} onVerified={() => { modal.close(); toast.show("changes-saved"); }} />

      <CloseAccountModal open={modal.is("close-account")} onClose={modal.close} onNext={() => modal.open("verify-close")} />
      <OtpModal open={modal.is("verify-close")} onClose={modal.close} destination={otpTo} onVerified={() => { modal.close(); toast.show("changes-saved"); }} />
    </>
  );
}

/** Contact edits are held until the OTP step confirms them. */
const pendingContact: { value: Partial<BusinessProfile["contact"]> | null } = { value: null };

function EditBusinessModal({ open, onClose, profile, onSaved }: { open: boolean; onClose: () => void; profile: BusinessProfile; onSaved: () => void }) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [category, setCategory] = useState(profile.category);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (open) {
      setDisplayName(profile.displayName);
      setCategory(profile.category);
      setError(null);
    }
  }, [open, profile]);

  const save = async () => {
    if (!displayName.trim()) return setError("Display name is required");
    await updateBusinessDetails({ displayName: displayName.trim(), category });
    onSaved();
  };

  return (
    <Modal open={open} onClose={onClose} width={565} title="Business details" description="Grey fields are locked after KYC. Contact support to change them." testId="edit-business-modal">
      <div className="flex w-full gap-3">
        <TextField label="Display name (shown to customers)" value={displayName} onChange={(e) => { setDisplayName(e.target.value); setError(null); }} error={error} />
        <Select label="Business category" value={category} onChange={(e) => setCategory(e.target.value)} options={BUSINESS_CATEGORIES.map((c) => ({ value: c, label: truncate(c) }))} />
      </div>
      <div className="flex w-full gap-3">
        <TextField label="Legal name" value={profile.legalName} disabled readOnly />
        <TextField label="Business type" value={profile.businessType} disabled readOnly />
      </div>
      <div className="flex w-full gap-3">
        <TextField label="PAN" value={profile.pan} disabled readOnly />
        <TextField label="GSTIN" value={profile.gstin} disabled readOnly />
      </div>
      <div className="flex w-full gap-3">
        <TextField label="CIN" value={profile.cin} disabled readOnly />
        <TextField label="Merchant ID" value={profile.merchantId} disabled readOnly />
      </div>
      <TextArea label="Registered address" value={profile.registeredAddress} disabled readOnly height={116} containerClassName="w-full" className="bg-container py-2.5" />
      <ModalActions>
        <Button variant="outline" block onClick={onClose}>Cancel</Button>
        <Button block onClick={save}>Update</Button>
      </ModalActions>
    </Modal>
  );
}

function EditContactModal({ open, onClose, profile, onNext }: { open: boolean; onClose: () => void; profile: BusinessProfile; onNext: () => void }) {
  const [form, setForm] = useState({ mobile: "", supportEmail: "", supportPhone: "", website: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    if (open) {
      setForm({ mobile: "+91 98765432", supportEmail: profile.contact.supportEmail, supportPhone: "+91 98765432", website: profile.contact.website });
      setErrors({});
    }
  }, [open, profile]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: "" }));
  };

  const submit = () => {
    const er: Record<string, string> = {};
    const digits = (v: string) => v.replace(/\D/g, "");
    if (digits(form.mobile).length < 10 && !isMobile(form.mobile)) er.mobile = "Enter a valid mobile number";
    if (!isEmail(form.supportEmail)) er.supportEmail = "Enter a valid email";
    if (digits(form.supportPhone).length < 10 && !isMobile(form.supportPhone)) er.supportPhone = "Enter a valid phone number";
    if (!form.website.trim()) er.website = "Website is required";
    setErrors(er);
    if (Object.values(er).some(Boolean)) return;
    pendingContact.value = { supportEmail: form.supportEmail.trim(), website: form.website.trim() };
    onNext();
  };

  return (
    <Modal open={open} onClose={onClose} width={565} title="Contact & support" description="Changes to login email or mobile are verified by a code and reviewed in 24–48 hours." testId="edit-contact-modal">
      <div className="flex w-full gap-3">
        <TextField label="Login email" value={profile.contact.loginEmail} disabled readOnly />
        <TextField label="Mobile number" value={form.mobile} onChange={set("mobile")} error={errors.mobile} inputMode="tel" />
      </div>
      <div className="flex w-full gap-3">
        <TextField label="Customer support email" value={form.supportEmail} onChange={set("supportEmail")} error={errors.supportEmail} type="email" />
        <TextField label="Customer support phone" value={form.supportPhone} onChange={set("supportPhone")} error={errors.supportPhone} inputMode="tel" />
      </div>
      <TextField label="Website" value={form.website} onChange={set("website")} error={errors.website} helper="Shown on checkout, receipts and refund emails" containerClassName="w-full" />
      <ModalActions>
        <Button variant="outline" block onClick={onClose}>Cancel</Button>
        <Button block onClick={submit}>Update</Button>
      </ModalActions>
    </Modal>
  );
}

function TransferOwnershipModal({ open, onClose, onNext }: { open: boolean; onClose: () => void; onNext: () => void }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (open) {
      setEmail("");
      setError(null);
    }
  }, [open]);
  const submit = async () => {
    if (!isEmail(email)) return setError("Enter a valid email address");
    await requestOwnershipTransfer(email.trim());
    onNext();
  };
  return (
    <Modal open={open} onClose={onClose} width={478} title="Transfer ownership" description="The new owner gets full control. You become an Admin." testId="transfer-ownership-modal">
      <Alert tone="warning" title="This cannot be undone">Only the new owner can transfer it back.</Alert>
      <TextField label="New owner email" placeholder="name@company.com" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(null); }} error={error} containerClassName="w-full" />
      <ModalActions>
        <Button variant="outline" block onClick={onClose}>Cancel</Button>
        <Button variant="danger" block onClick={submit}>Transfer</Button>
      </ModalActions>
    </Modal>
  );
}

function CloseAccountModal({ open, onClose, onNext }: { open: boolean; onClose: () => void; onNext: () => void }) {
  const [confirm, setConfirm] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (open) {
      setConfirm("");
      setReason("");
      setError(null);
    }
  }, [open]);
  const submit = async () => {
    if (confirm.trim() !== "CLOSE") return setError("Type CLOSE in capitals to confirm");
    await requestAccountClosure(reason);
    onNext();
  };
  return (
    <Modal open={open} onClose={onClose} width={478} title="Close merchant account" description="Payments and payouts stop immediately." testId="close-account-modal">
      <Alert tone="error" showIcon={false} title="Pending settlements are paid out first">Closing starts a 7 day review before data is archived.</Alert>
      <TextField label="Type CLOSE to confirm" value={confirm} onChange={(e) => { setConfirm(e.target.value); setError(null); }} error={error} containerClassName="w-full" autoComplete="off" />
      <TextArea label="Reason (optional)" placeholder="Tell us why you are leaving" value={reason} onChange={(e) => setReason(e.target.value)} helper="Shown on your checkout page" height={96} containerClassName="w-full" className="py-2.5" />
      <ModalActions>
        <Button variant="outline" block onClick={onClose}>Keep account</Button>
        <Button variant="danger" block onClick={submit}>Close account</Button>
      </ModalActions>
    </Modal>
  );
}
