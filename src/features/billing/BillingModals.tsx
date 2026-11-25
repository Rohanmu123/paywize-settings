"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Ellipsis, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { DataTable } from "@/components/ui/DataTable";
import { Drawer } from "@/components/ui/Drawer";
import { Icon } from "@/components/ui/Icon";
import { Modal, ModalActions } from "@/components/ui/Modal";
import { TextArea, TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/Toast";
import { BILLED_TO, INVOICE_STATUS, SUPPLIER, type Invoice } from "@/data/billing";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/format";
import { isMobile } from "@/lib/validation";
import { downloadInvoice, emailInvoice, invoiceTotal, requestAccountManagerCall } from "@/services/billing";

const inr = (n: number) => formatINR(n).replace("₹", "₹ ");
const prettyMobile = (m: string) => `+91 ${m.slice(0, 5)} ${m.slice(5)}`;

export function TalkToManagerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const [mobile, setMobile] = useState("");
  const [need, setNeed] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMobile(prettyMobile("9876543210"));
    setNeed("");
    setError(null);
  }, [open]);

  const submit = async () => {
    if (!isMobile(mobile)) return setError("Enter a valid 10-digit mobile number");
    setBusy(true);
    await requestAccountManagerCall({ mobile, need });
    setBusy(false);
    onClose();
    toast.show("request-submitted");
  };

  return (
    <Modal open={open} onClose={onClose} width={364} title="Talk to account manager" description="We will call you within one working day." testId="account-manager-modal">
      <TextField label="Mobile number" type="tel" inputMode="tel" containerClassName="w-full" value={mobile} onChange={(e) => { setMobile(e.target.value); setError(null); }} error={error} />
      <TextArea label="What do you need?" placeholder="Plan upgrade, custom pricing…" containerClassName="w-full" height={96} maxLength={500} value={need} onChange={(e) => setNeed(e.target.value)} helper="Shown on your checkout page" />
      <ModalActions>
        <Button variant="outline" block onClick={onClose}>Cancel</Button>
        <Button block onClick={submit} disabled={busy}>Request call</Button>
      </ModalActions>
    </Modal>
  );
}

function KeyValueCard({ title, rows }: { title: string; rows: { label: string; value: string; strong?: boolean }[] }) {
  return (
    <div className="flex w-full flex-col items-start gap-2.5 whitespace-nowrap">
      <p className="type-12sb text-text-primary">{title}</p>
      <dl className="flex w-full flex-col overflow-clip rounded-[20px] border border-border">
        {rows.map((r) => (
          <div key={r.label} className="flex w-full items-center justify-between border-b-[0.5px] border-border-variant px-4 py-[11px] type-14r">
            <dt className={cn("text-text-secondary", r.strong && "font-semibold")}>{r.label}</dt>
            <dd className="font-semibold text-text-primary">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-1">
      <p className="type-12r whitespace-nowrap text-text-secondary">{label}</p>
      <div className="flex items-center gap-2 type-14sb whitespace-nowrap text-text-primary">{children}</div>
    </div>
  );
}

export function InvoiceDrawer({ open, onClose, invoice }: { open: boolean; onClose: () => void; invoice: Invoice }) {
  const toast = useToast();
  const [tab, setTab] = useState<"details" | "payments">("details");
  const [menu, setMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const status = INVOICE_STATUS[invoice.status];
  const total = invoiceTotal(invoice);

  useEffect(() => {
    if (open) setTab("details");
  }, [open, invoice.number]);

  useEffect(() => {
    if (!menu) return;
    const off = (e: MouseEvent) => !menuRef.current?.contains(e.target as Node) && setMenu(false);
    document.addEventListener("mousedown", off);
    return () => document.removeEventListener("mousedown", off);
  }, [menu]);

  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(invoice.number);
    } catch {
      /* clipboard can be blocked; the visual confirmation still helps */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const sendEmail = async () => {
    setMenu(false);
    await emailInvoice(invoice.number);
    toast.show("request-submitted");
  };

  return (
    <Drawer open={open} onClose={onClose} label={`Tax invoice ${invoice.number}`} className="gap-4 px-6 pt-4 pb-6">
      <div className="flex w-full items-center justify-between">
        <div className="relative" ref={menuRef}>
          <button type="button" aria-label="More actions" aria-expanded={menu} onClick={() => setMenu((m) => !m)} className="flex size-8 items-center justify-center rounded-2xl text-text-primary hover:bg-container">
            <Icon icon={Ellipsis} size={16} />
          </button>
          {menu && (
            <div role="menu" className="absolute top-9 left-0 z-10 flex w-48 flex-col rounded-2xl border border-border bg-surface p-1 shadow-toast">
              {[
                { label: "Copy invoice number", run: () => { copy(); setMenu(false); } },
                { label: "Email invoice", run: sendEmail },
                { label: "Download PDF", run: () => { setMenu(false); downloadInvoice(invoice); toast.show("download-started"); } },
              ].map((i) => (
                <button key={i.label} role="menuitem" type="button" onClick={i.run} className="rounded-xl px-3 py-2 text-left type-14r text-text-primary hover:bg-background">
                  {i.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button type="button" aria-label="Close" onClick={onClose} className="flex size-8 items-center justify-center rounded-2xl text-text-primary hover:bg-container">
          <Icon icon={X} size={16} strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex w-full items-center justify-between rounded-3xl border border-border py-4 pr-4 pl-5">
        <div className="flex flex-col items-start gap-1 whitespace-nowrap">
          <h2 className="type-18sb text-text-primary">Tax invoice {invoice.number}</h2>
          <p className="type-12r text-text-secondary">
            E-invoice · Period {invoice.period} · Issued {invoice.issuedOn}
          </p>
        </div>
        <Chip tone={status.tone}>{status.label}</Chip>
      </div>

      <div role="tablist" className="flex w-full items-start gap-7 border-b border-border-variant">
        {(["details", "payments"] as const).map((t) => (
          <button key={t} role="tab" type="button" aria-selected={tab === t} onClick={() => setTab(t)} className="flex flex-col items-start gap-2.5 pt-2">
            <span className={cn("type-14sb whitespace-nowrap", tab === t ? "text-primary" : "text-text-secondary")}>{t === "details" ? "Invoice details" : "Payments"}</span>
            <span className={cn("h-0.5 w-full", tab === t && "bg-primary")} />
          </button>
        ))}
      </div>

      {tab === "details" ? (
        <div className="flex w-full flex-col items-start gap-3" role="tabpanel">
          <div className="flex w-full items-start rounded-[20px] bg-container px-5 py-4">
            <div className="flex min-w-px flex-1 flex-col items-start gap-5">
              <Fact label="Invoice no.">
                <span className="text-primary">{invoice.number}</span>
                <button type="button" aria-label={copied ? "Copied" : "Copy invoice number"} onClick={copy} className="text-text-primary">
                  <Icon icon={Copy} size={14} strokeWidth={1.5} />
                </button>
                {copied && <span className="type-12r text-success">Copied</span>}
              </Fact>
              <Fact label="Period">{invoice.period}</Fact>
            </div>
            <div className="w-px self-stretch bg-border" />
            <div className="flex min-w-px flex-1 flex-col items-start gap-5 pl-5">
              <Fact label="Issued on">{invoice.issuedOn}</Fact>
              <Fact label="Due by">{invoice.dueBy}</Fact>
            </div>
          </div>
          <KeyValueCard title="IRN · e-invoice" rows={[{ label: "IRN", value: invoice.irn }, { label: "Ack no. · Status", value: `${invoice.ackNo} · Generated on IRP` }]} />
          <KeyValueCard title="Parties" rows={[{ label: "Supplier GSTIN", value: `${SUPPLIER.gstin} · ${SUPPLIER.name}` }, { label: "Billed to GSTIN", value: `${BILLED_TO.gstin} · ${BILLED_TO.name}` }]} />
          <div className="flex w-full flex-col items-start gap-2.5">
            <p className="type-12sb text-text-primary">Line items</p>
            <DataTable
              caption="Line items"
              headerTone="container"
              rowHeight={40}
              rows={invoice.lineItems}
              rowKey={(l) => l.description}
              className="[&_tbody_tr:last-child_td]:border-b-[0.5px] [&_tbody_tr:last-child_td]:border-border"
              columns={[
                { key: "d", header: "Description", render: (l) => l.description },
                { key: "sac", header: "SAC", width: 100, render: (l) => l.sac },
                { key: "amt", header: "Amount", width: 120, render: (l) => inr(l.amount) },
              ]}
            />
          </div>
          <KeyValueCard title="Amount" rows={[{ label: "Total taxable value", value: inr(invoice.fees) }, { label: "IGST @ 18%", value: inr(invoice.gst) }, { label: "Total invoice value", value: inr(total), strong: true }]} />
        </div>
      ) : (
        <div className="flex w-full flex-col items-start gap-3" role="tabpanel">
          {invoice.payments.length === 0 ? (
            <div className="flex w-full flex-col items-center gap-1.5 rounded-[20px] bg-container px-5 py-8 text-center">
              <p className="type-14sb text-text-primary">No payments yet</p>
              <p className="type-12r text-text-secondary">
                {inr(total)} is due by {invoice.dueBy}. Unpaid amounts are adjusted from your next settlement.
              </p>
            </div>
          ) : (
            <DataTable
              caption="Payments"
              headerTone="container"
              rowHeight={40}
              rows={invoice.payments}
              rowKey={(p) => p.reference}
              columns={[
                { key: "date", header: "Date", width: 100, render: (p) => p.date },
                { key: "method", header: "Method", render: (p) => p.method },
                { key: "amt", header: "Amount", width: 120, render: (p) => inr(p.amount) },
              ]}
            />
          )}
        </div>
      )}

      <div className="min-h-px flex-1" />
      <div className="flex w-full items-start gap-3">
        <Button variant="outline" block onClick={sendEmail}>Email invoice</Button>
        <Button block onClick={() => { downloadInvoice(invoice); toast.show("download-started"); }}>Download e-invoice PDF</Button>
      </div>
    </Drawer>
  );
}

