"use client";

import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { Card, CardHeader } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { DataTable } from "@/components/ui/DataTable";
import { Icon } from "@/components/ui/Icon";
import { TextField } from "@/components/ui/TextField";
import { TextLink } from "@/components/ui/TextLink";
import { useToast } from "@/components/ui/Toast";
import { INVOICE_STATUS, PRICING } from "@/data/billing";
import { formatINR } from "@/lib/format";
import { useStore } from "@/lib/store";
import { useModal } from "@/lib/useModal";
import { isEmail } from "@/lib/validation";
import { downloadInvoice, gstStore, invoicesStore, invoiceTotal, updateBillingEmail } from "@/services/billing";
import { InvoiceDrawer, TalkToManagerModal } from "./BillingModals";


export function BillingView() {
  const invoices = useStore(invoicesStore);
  const gst = useStore(gstStore);
  const toast = useToast();
  const modal = useModal<"account-manager" | "invoice">();
  const [showAlert, setShowAlert] = useState(true);
  const [email, setEmail] = useState(gst.billingEmail);
  const [emailError, setEmailError] = useState<string | null>(null);
  const due = invoices.find((i) => i.status === "due");
  const openInvoice = invoices.find((i) => i.number === modal.target);

  const saveEmail = async () => {
    const v = email.trim();
    if (v === gst.billingEmail) return;
    if (!isEmail(v)) return setEmailError("Enter a valid email");
    await updateBillingEmail(v);
    toast.show("changes-saved");
  };

  return (
    <>
      <PageHeader title="Billing & invoices" scope="Applies to every service" />

      {showAlert && due && (
        <Alert tone="warning" title={`${due.period.split(" ")[0]} invoice is due on 5 Nov`} onDismiss={() => setShowAlert(false)}>
          {formatINR(invoiceTotal(due))} will be adjusted from your next settlement if unpaid by the due date.
        </Alert>
      )}

      <Card aria-label="Current pricing">
        <CardHeader icon={FileText} title="Current pricing" action={<TextLink onClick={() => modal.open("account-manager")}>Talk to account manager</TextLink>} />
        <DataTable
          caption="Current pricing"
          rows={PRICING}
          rowKey={(r) => r.service}
          columns={[
            { key: "service", header: "Service", render: (r) => r.service },
            { key: "upi", header: "UPI", width: 110, render: (r) => r.upi },
            { key: "cards", header: "Cards", width: 110, render: (r) => r.cards },
            { key: "nb", header: "Netbanking", width: 110, render: (r) => r.netbanking },
            { key: "settlement", header: "Settlement", width: 120, render: (r) => r.settlement },
          ]}
        />
      </Card>

      <Card aria-label="GST details for invoices">
        <CardHeader icon={FileText} title="GST details for invoices" />
        <div className="flex w-full items-start gap-4">
          <TextField label="GSTIN" value={gst.gstin} readOnly helper="Verified with the GST portal" />
          <TextField
            label="Billing email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError(null);
            }}
            onBlur={saveEmail}
            onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
            error={emailError}
            helper={"​"}
          />
        </div>
      </Card>

      <Card aria-label="Invoices">
        <CardHeader icon={FileText} title="Invoices" action={<TextLink onClick={() => toast.show("download-started")}>Download all</TextLink>} />
        <DataTable
          caption="Invoices"
          rows={invoices}
          rowKey={(i) => i.number}
          columns={[
            {
              key: "invoice",
              header: "Invoice",
              render: (i) => (
                <button type="button" className="text-[12px] leading-[14px] font-bold text-primary hover:underline" onClick={() => modal.open("invoice", i.number)}>
                  {i.number}
                </button>
              ),
            },
            { key: "period", header: "Period", width: 124, render: (i) => i.period },
            { key: "fees", header: "Fees", width: 110, render: (i) => formatINR(i.fees) },
            { key: "gst", header: "GST (18%)", width: 110, render: (i) => formatINR(i.gst) },
            { key: "status", header: "Status", width: 100, render: (i) => <Chip tone={INVOICE_STATUS[i.status].tone}>{INVOICE_STATUS[i.status].label}</Chip> },
            {
              key: "dl",
              header: <span className="sr-only">Download</span>,
              width: 48,
              align: "right",
              render: (i) => (
                <button
                  type="button"
                  aria-label={`Download ${i.number}`}
                  className="inline-flex text-primary"
                  onClick={() => {
                    downloadInvoice(i);
                    toast.show("download-started");
                  }}
                >
                  <Icon icon={Download} size={16} />
                </button>
              ),
            },
          ]}
        />
      </Card>

      <TalkToManagerModal open={modal.is("account-manager")} onClose={modal.close} />
      {openInvoice && <InvoiceDrawer open={modal.is("invoice")} onClose={modal.close} invoice={openInvoice} />}
    </>
  );
}
