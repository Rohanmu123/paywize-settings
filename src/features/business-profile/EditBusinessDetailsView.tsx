"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, FileText, Globe, Lock } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SaveBar } from "@/components/layout/SaveBar";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { FileDrop } from "@/components/ui/FileDrop";
import { Icon } from "@/components/ui/Icon";
import { Modal, ModalActions } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { TextArea, TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/Toast";
import { BUSINESS_CATEGORIES } from "@/data/business";
import { INDIAN_STATES } from "@/data/geo";
import { ROUTES } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { useModal } from "@/lib/useModal";
import { businessStore, raiseChangeRequest, updateBusinessDetails, updateContact } from "@/services/business";
import { countChanges, saveBarMessage, validateEditDetails, type EditDetailsForm } from "./editDetails";
import { ProfileSummary } from "./ProfileSummary";

const LABELS: Record<keyof EditDetailsForm, string> = {
  displayName: "Display name",
  website: "Website",
  supportEmail: "Support email",
  supportPhone: "Support phone",
  category: "Business category",
  line1: "Address line 1",
  city: "City",
  state: "State",
  pin: "PIN code",
};

function LegalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full items-center gap-2.5 overflow-clip">
      <p className="w-[180px] shrink-0 type-12sb text-text-secondary">{label}</p>
      <Icon icon={Lock} size={16} className="text-text-primary" />
      <p className="type-14m text-text-primary whitespace-nowrap">{value}</p>
    </div>
  );
}

export function EditBusinessDetailsView() {
  const profile = useStore(businessStore);
  const router = useRouter();
  const toast = useToast();
  const modal = useModal<"change-request">();

  const initial = useMemo<EditDetailsForm>(
    () => ({
      displayName: profile.displayName,
      website: "https://sharmatextiles.in",
      supportEmail: profile.contact.supportEmail,
      supportPhone: "+91 98765 43210",
      category: profile.category,
      line1: "14, Textile Market, Ring Road",
      city: "Surat",
      state: "Gujarat",
      pin: "395002",
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [form, setForm] = useState(initial);
  const [touched, setTouched] = useState<Partial<Record<keyof EditDetailsForm, boolean>>>({});
  const [showInfo, setShowInfo] = useState(true);

  const errors = validateEditDetails(form);
  const visibleErrors = Object.fromEntries(Object.entries(errors).filter(([k]) => touched[k as keyof EditDetailsForm])) as typeof errors;
  const changes = countChanges(initial, form);
  const hasErrors = Object.keys(errors).length > 0;

  const bind = (k: keyof EditDetailsForm) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [k]: e.target.value }));
      setTouched((t) => ({ ...t, [k]: true }));
    },
  });

  const save = async () => {
    if (hasErrors) {
      setTouched(Object.fromEntries(Object.keys(LABELS).map((k) => [k, true])));
      return;
    }
    await updateBusinessDetails({ displayName: form.displayName.trim(), category: form.category, operatingAddress: `${form.line1}, ${form.city}, ${form.state} ${form.pin}` });
    await updateContact({ supportEmail: form.supportEmail.trim(), website: form.website.replace(/^https?:\/\//, "www.") });
    toast.show("changes-saved");
    router.push(ROUTES.businessProfile);
  };

  return (
    <>
      <PageHeader title="Edit business details" subtitle="· Legal details are locked after KYC" backHref={ROUTES.businessProfile} scope="Applies to every service">
        <ProfileSummary profile={profile} />
      </PageHeader>

      <div className="flex w-full flex-col items-start gap-4">
        <div className="flex w-full flex-col items-start gap-3">
          <Card aria-label="Public details">
            <CardHeader icon={Globe} title="Public details" />
            <div className="flex w-full gap-4">
              <TextField label="Display name" {...bind("displayName")} error={visibleErrors.displayName} />
              <TextField label="Website" {...bind("website")} error={visibleErrors.website} />
            </div>
            <div className="flex w-full gap-4">
              <TextField label="Support email" type="email" {...bind("supportEmail")} error={visibleErrors.supportEmail} />
              <TextField label="Support phone" inputMode="tel" {...bind("supportPhone")} error={visibleErrors.supportPhone} />
            </div>
            <Select label="Business category" containerClassName="w-full" {...bind("category")} options={BUSINESS_CATEGORIES.map((c) => ({ value: c, label: c }))} />
          </Card>

          <Card aria-label="Registered address">
            <CardHeader icon={Building2} title="Registered address" />
            <TextField label="Address line 1" containerClassName="w-full" {...bind("line1")} error={visibleErrors.line1} />
            <div className="flex w-full items-start gap-4">
              <TextField label="City" {...bind("city")} error={visibleErrors.city} />
              <Select label="State" {...bind("state")} options={INDIAN_STATES.map((s) => ({ value: s, label: s }))} />
              <TextField label="PIN code" inputMode="numeric" maxLength={6} {...bind("pin")} error={visibleErrors.pin} />
            </div>
          </Card>
        </div>

        <Card aria-label="Legal details">
          <CardHeader icon={FileText} title="Legal details" />
          <LegalRow label="Legal name" value={profile.legalName} />
          <LegalRow label="PAN" value="AAGCS••••K" />
          <LegalRow label="GSTIN" value="24AAGCS••••K1Z5" />
          <LegalRow label="CIN" value="U17•••GJ2014PTC•••••" />
          {showInfo && (
            <Alert tone="info" title="Need to change a legal detail?" onDismiss={() => setShowInfo(false)}>
              Raise a change request with supporting documents. Review takes 2 to 3 working days and settlements keep running.
            </Alert>
          )}
          <Button variant="outline" onClick={() => modal.open("change-request")}>
            Raise change request
          </Button>
        </Card>

        <SaveBar message={saveBarMessage(changes, errors, LABELS)} onDiscard={() => router.push(ROUTES.businessProfile)} onSave={save} />
      </div>

      <RaiseChangeRequestModal open={modal.is("change-request")} onClose={modal.close} onSubmitted={() => { modal.close(); toast.show("request-submitted"); }} />
    </>
  );
}

export function RaiseChangeRequestModal({ open, onClose, onSubmitted }: { open: boolean; onClose: () => void; onSubmitted: () => void }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!text.trim()) return setError("Describe what should change");
    if (fileError) return;
    await raiseChangeRequest("legal", text.trim(), file?.name ?? "");
    setText("");
    setFile(null);
    onSubmitted();
  };

  return (
    <Modal open={open} onClose={onClose} width={478} title="Raise change request" description="Our team verifies changes in 2 to 3 working days." testId="change-request-modal">
      <TextArea label="What should change?" placeholder="Describe the update" helper="Shown on your checkout page" height={96} containerClassName="w-full" className="py-2.5" value={text} onChange={(e) => { setText(e.target.value); setError(null); }} error={error} />
      <FileDrop file={file} error={fileError} onFile={(f, err) => { setFile(f); setFileError(err); }} />
      <ModalActions>
        <Button variant="outline" block onClick={onClose}>Cancel</Button>
        <Button block onClick={submit}>Submit</Button>
      </ModalActions>
    </Modal>
  );
}
