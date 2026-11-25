"use client";

import { useState } from "react";
import { IdCard, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Chip, type ChipTone } from "@/components/ui/Chip";
import { DataTable } from "@/components/ui/DataTable";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TextLink } from "@/components/ui/TextLink";
import { processingLimit, type KycDocument, type KycStatus } from "@/data/kyc";
import { formatINR } from "@/lib/format";
import { useStore } from "@/lib/store";
import { useModal } from "@/lib/useModal";
import { attentionCount, kycStore } from "@/services/kyc";
import { UploadDocumentModal, ViewDocumentModal } from "./KycModals";

const STATUS: Record<KycStatus, { label: string; tone: ChipTone }> = {
  verified: { label: "Verified", tone: "success" },
  expiring: { label: "Expires in 7 days", tone: "warning" },
  rejected: { label: "Rejected", tone: "error" },
  pending: { label: "Pending", tone: "neutral" },
};

export function KycView() {
  const docs = useStore(kycStore);
  const modal = useModal<"upload" | "view">();
  const [showAlert, setShowAlert] = useState(true);
  const attention = attentionCount(docs);
  const expiring = docs.find((d) => d.status === "expiring");

  const actionFor = (d: KycDocument) => {
    if (d.status === "verified") return <TextLink onClick={() => modal.open("view", d.id)}>View</TextLink>;
    if (d.status === "pending" && !d.file) return <TextLink onClick={() => modal.open("upload", d.id)}>Upload</TextLink>;
    if (d.status === "pending") return <TextLink onClick={() => modal.open("view", d.id)}>View</TextLink>;
    return <TextLink onClick={() => modal.open("upload", d.id)}>Re-upload</TextLink>;
  };

  return (
    <>
      <PageHeader title="KYC & compliance" scope="Applies to every service" />

      {showAlert && attention > 0 && (
        <Alert tone="warning" title={`${expiring ? 1 : attention} document needs attention`} onDismiss={() => setShowAlert(false)}>
          {expiring ? `Your address proof expires on ${expiring.expiresOn}. Upload a new one to avoid a settlement hold.` : "Re-upload the rejected document to keep settlements running."}
        </Alert>
      )}

      <Card aria-label="Processing limit">
        <CardHeader icon={IdCard} title="Processing limit" />
        <div className="flex w-full flex-col items-start gap-2">
          <div className="flex w-full items-start justify-between whitespace-nowrap">
            <p className="type-14sb text-text-primary">{formatINR(processingLimit.used, { decimals: 0 })} used</p>
            <p className="type-14m text-text-secondary">{formatINR(processingLimit.limit, { decimals: 0 })} limit</p>
          </div>
          <ProgressBar value={processingLimit.used} max={processingLimit.limit} label="Processing limit used" />
        </div>
      </Card>

      <Card aria-label="Documents">
        <CardHeader
          icon={ShieldCheck}
          title="Documents"
          action={
            <Button size="sm" onClick={() => modal.open("upload")}>
              Upload document
            </Button>
          }
        />
        <DataTable
          caption="KYC documents"
          rows={docs}
          rowKey={(d) => d.id}
          columns={[
            { key: "doc", header: "Document", render: (d) => d.name },
            { key: "status", header: "Status", width: 150, render: (d) => <Chip tone={STATUS[d.status].tone}>{STATUS[d.status].label}</Chip> },
            { key: "note", header: "Note", width: 230, render: (d) => d.note },
            { key: "action", header: <span className="sr-only">Action</span>, width: 90, align: "right", render: actionFor },
          ]}
        />
      </Card>

      <UploadDocumentModal open={modal.is("upload")} onClose={modal.close} presetId={modal.target} />
      <ViewDocumentModal open={modal.is("view")} onClose={modal.close} doc={docs.find((d) => d.id === modal.target) ?? docs[0]!} />
    </>
  );
}
