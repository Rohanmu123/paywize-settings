"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { DetailGrid, DetailModal, DocPreview } from "@/components/ui/DetailModal";
import { FileDrop } from "@/components/ui/FileDrop";
import { Modal, ModalActions } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/Toast";
import { KYC_DOCUMENT_TYPES, type KycDocument } from "@/data/kyc";
import { formatDateInput, parseDateInput } from "@/lib/date";
import { useStore } from "@/lib/store";
import { kycStore, uploadKycDocument } from "@/services/kyc";

export function UploadDocumentModal({ open, onClose, presetId }: { open: boolean; onClose: () => void; presetId?: string | null }) {
  const docs = useStore(kycStore);
  const preset = docs.find((d) => d.id === presetId);
  const [type, setType] = useState("Turnover declaration");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [expiry, setExpiry] = useState("");
  const [expiryError, setExpiryError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setType(preset ? KYC_DOCUMENT_TYPES.find((t) => preset.name.startsWith(t)) ?? preset.type : "Turnover declaration");
    setFile(null);
    setFileError(null);
    setExpiry("");
    setExpiryError(null);
  }, [open, preset]);

  const submit = async () => {
    if (!file) return setFileError("Choose a file to upload");
    if (fileError) return;
    if (expiry && !parseDateInput(expiry)) return setExpiryError("Enter a valid date");
    await uploadKycDocument({ type, file, expiry: expiry || undefined });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} width={364} title="Upload document" description="PDF, JPG or PNG up to 5 MB." testId="upload-document-modal">
      <Select label="Document type" containerClassName="w-full" value={type} onChange={(e) => setType(e.target.value)} options={KYC_DOCUMENT_TYPES.map((t) => ({ value: t, label: t }))} />
      <FileDrop title="Drop a file here or browse" hint="PDF, JPG or PNG · up to 5 MB" gap={8} file={file} error={fileError} onFile={(f, err) => { setFile(f); setFileError(err); }} />
      <TextField label="Expiry date" placeholder="DD / MM / YYYY" inputMode="numeric" containerClassName="w-full" value={expiry} onChange={(e) => { setExpiry(formatDateInput(e.target.value)); setExpiryError(null); }} error={expiryError} />
      <ModalActions>
        <Button variant="outline" block onClick={onClose}>Cancel</Button>
        <Button block onClick={submit}>Upload</Button>
      </ModalActions>
    </Modal>
  );
}

export function ViewDocumentModal({ open, onClose, doc }: { open: boolean; onClose: () => void; doc: KycDocument }) {
  const toast = useToast();
  const f = doc.file ?? { name: "—", format: "PDF" as const, sizeMb: 0, uploadedOn: "—" };
  const verified = doc.status === "verified";
  return (
    <DetailModal
      open={open}
      onClose={onClose}
      icon={FileText}
      title={doc.type}
      meta={`${f.format} · ${f.sizeMb} MB · Uploaded ${f.uploadedOn}`}
      chip={<Chip tone={verified ? "success" : "neutral"}>{verified ? "Verified" : "Pending"}</Chip>}
      testId="view-document-modal"
      footer={
        <>
          <Button variant="outline" block onClick={onClose}>Close</Button>
          <Button block onClick={() => { onClose(); toast.show("download-started"); }}>Download</Button>
        </>
      }
    >
      <DocPreview />
      <DetailGrid
        items={[
          { label: "Document type", value: doc.type },
          { label: "Uploaded on", value: f.uploadedOn },
          { label: "Status", value: verified ? "Verified" : "Pending" },
          { label: "File", value: f.name },
        ]}
      />
    </DetailModal>
  );
}
