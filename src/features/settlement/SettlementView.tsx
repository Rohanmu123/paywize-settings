"use client";

import { useState } from "react";
import { Check, CircleX, Landmark, Lock } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ServiceScope } from "@/components/layout/ServiceScope";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { DataTable } from "@/components/ui/DataTable";
import { Icon } from "@/components/ui/Icon";
import { OtpModal } from "@/components/ui/OtpModal";
import { Radio } from "@/components/ui/Radio";
import { Switch } from "@/components/ui/Switch";
import { TextLink } from "@/components/ui/TextLink";
import { useToast } from "@/components/ui/Toast";
import { businessProfile } from "@/data/business";
import { ACCOUNT_STATUS, CHANGE_STEPS, PAGE_SCHEDULES, SCHEDULES, type BankAccount, type ChangeRequest, type ScheduleId } from "@/data/settlement";
import { cn } from "@/lib/cn";
import { maskMobile } from "@/lib/format";
import { useStore } from "@/lib/store";
import { useModal } from "@/lib/useModal";
import { maskAccount, primaryAccount, setInstantSettlement, setSettlementsPaused, settlementStore } from "@/services/settlement";
import { AddBankModal, CancelRequestModal, EditScheduleModal, FixRetryModal, ViewBankModal, ViewChequeModal, type SettlementModal } from "./SettlementModals";

function Steps({ step }: { step: ChangeRequest["step"] }) {
  return (
    <ol className="flex w-full items-start" aria-label="Change request progress">
      {CHANGE_STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const current = n === step;
        const last = n === CHANGE_STEPS.length;
        return (
          <li key={label} className={cn("flex flex-col items-start gap-1.5", last ? "shrink-0 items-end" : "min-w-px flex-1")} aria-current={current ? "step" : undefined}>
            <div className={cn("flex w-full items-center", last && "justify-end")}>
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full type-12sb",
                  done ? "bg-success text-on-primary" : current ? "bg-primary text-on-primary" : "border border-border text-text-tertiary",
                )}
              >
                {done ? <Icon icon={Check} size={12} strokeWidth={2} /> : n}
              </span>
              {!last && <span className={cn("h-0.5 min-w-px flex-1", done ? "bg-success" : "bg-border")} />}
            </div>
            <span className={cn("type-12m whitespace-nowrap", current ? "font-semibold text-on-warning-container" : last && !done ? "text-text-secondary" : "text-on-warning-container")}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function SettlementView() {
  const s = useStore(settlementStore);
  const toast = useToast();
  const modal = useModal<SettlementModal>();
  const [showMismatch, setShowMismatch] = useState(true);
  const [presetSchedule, setPresetSchedule] = useState<ScheduleId | null>(null);
  const primary = primaryAccount(s);
  const requested = s.request ? s.accounts.find((a) => a.id === s.request!.accountId) : undefined;
  const mismatch = s.accounts.find((a) => a.status === "mismatch");
  const target = s.accounts.find((a) => a.id === modal.target);
  const pageSchedules = PAGE_SCHEDULES.includes(s.schedule) ? PAGE_SCHEDULES : [...PAGE_SCHEDULES, s.schedule];

  const action = (a: BankAccount) => {
    if (a.status === "primary") return <TextLink onClick={() => modal.open("cheque", a.id)}>Cheque</TextLink>;
    if (a.status === "review" && s.request?.accountId === a.id)
      return (
        <button type="button" className="type-12m text-error hover:underline" onClick={() => modal.open("cancel-request")}>
          Cancel
        </button>
      );
    if (a.status === "mismatch") return <TextLink onClick={() => modal.open("fix-retry", a.id)}>Fix &amp; retry</TextLink>;
    return null;
  };

  return (
    <>
      <PageHeader title="Settlement account" actions={<ServiceScope />} />

      <section aria-label="Primary settlement account" className="flex w-full items-center gap-2 rounded-3xl bg-surface px-5 py-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/banks/hdfc.svg" alt="" className="size-6 shrink-0" />
        <div className="flex min-w-px flex-1 flex-col items-start gap-1">
          <p className="type-12r text-text-secondary">Settlement account</p>
          <div className="flex items-center gap-2">
            <h2 className="type-16sb whitespace-nowrap text-text-primary">
              {primary.bank} · {primary.type} ••{primary.last4}
            </h2>
            <Chip tone="brand">Primary</Chip>
            <Chip tone="success">Penny-drop verified</Chip>
          </div>
          <p className="type-12r whitespace-nowrap text-text-secondary">
            {primary.holder} · IFSC {primary.ifsc} · {primary.branch} branch · Added {primary.added}
          </p>
        </div>
        <TextLink onClick={() => modal.open("view-bank", primary.id)}>Change account</TextLink>
      </section>

      {s.request && requested && (
        <section aria-label="Change request under review" className="flex w-full flex-col items-start gap-4 rounded-3xl bg-warning-container p-5">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon={Lock} size={18} className="text-primary" />
              <div className="flex flex-col items-start gap-1 whitespace-nowrap">
                <h2 className="text-[14px] leading-[18px] font-semibold text-text-primary">Change request under review</h2>
                <p className="type-12r text-text-secondary">
                  {maskAccount(requested)} · Submitted {s.request.submitted} by {s.request.by} · Usually 24–48 hours
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-6 items-center rounded-xl bg-on-warning-container px-2.5 type-12sb whitespace-nowrap text-warning-container">
                Step {s.request.step} of {CHANGE_STEPS.length}
              </span>
              <TextLink onClick={() => modal.open("cancel-request")}>Cancel request</TextLink>
            </div>
          </div>
          <Steps step={s.request.step} />
          <p className="w-full type-12r text-on-warning-container">
            Settlements keep going to {primary.bank.split(" ")[0]} ••{primary.last4} until {requested.bank.split(" ")[0]} is approved. If the request fails, nothing changes.
          </p>
        </section>
      )}

      <Card aria-label="All bank accounts">
        <CardHeader icon={Landmark} title="All bank accounts" action={<Button size="sm" onClick={() => modal.open("add-bank")}>Add bank account</Button>} />
        <DataTable
          caption="Bank accounts"
          rows={s.accounts}
          rowKey={(a) => a.id}
          columns={[
            { key: "account", header: "Account", render: (a) => maskAccount(a) },
            { key: "status", header: "Status", width: 170, render: (a) => <Chip tone={ACCOUNT_STATUS[a.status].tone}>{ACCOUNT_STATUS[a.status].label}</Chip> },
            { key: "added", header: "Added", width: 110, render: (a) => a.added },
            { key: "action", header: <span className="sr-only">Action</span>, width: 110, align: "right", render: action },
          ]}
        />
        {showMismatch && mismatch && (
          <Alert tone="error" icon={CircleX} title={`${maskAccount(mismatch)} could not be verified`} onDismiss={() => setShowMismatch(false)} showIcon>
            Account holder “{mismatch.holderOnBank}” does not match “{businessProfile.legalName}”. Use an account in the business name or upload a bank letter.
          </Alert>
        )}
      </Card>

      <Card aria-label="Settlement schedule">
        <CardHeader
          icon={Landmark}
          title={
            <button type="button" className="hover:underline" onClick={() => { setPresetSchedule(null); modal.open("schedule"); }}>
              Settlement schedule
            </button>
          }
        />
        <div className="flex w-full flex-col items-start gap-3">
          <div className="flex w-full flex-col items-start gap-3" role="radiogroup" aria-label="Settlement schedule">
            {pageSchedules.map((id) => (
              <Radio
                key={id}
                name="schedule"
                value={id}
                checked={s.schedule === id}
                onChange={() => {
                  if (id === s.schedule) return;
                  setPresetSchedule(id);
                  modal.open("schedule");
                }}
                label={`${SCHEDULES[id].page}${s.schedule === id ? " (current)" : ""}`}
              />
            ))}
          </div>
          <div className="h-px w-full bg-border-variant" />
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col items-start gap-0.5 whitespace-nowrap">
              <p className="type-14sb text-text-primary">Instant settlement</p>
              <p className="type-12r text-text-secondary">Get paid in 30 minutes, 24×7. 1.2% + GST, up to ₹5,00,000 a day.</p>
            </div>
            <Switch
              aria-label="Instant settlement"
              checked={s.instant}
              onChange={async (v) => {
                await setInstantSettlement(v);
                toast.show("changes-saved");
              }}
            />
          </div>
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col items-start gap-0.5 whitespace-nowrap">
              <p className="type-14sb text-text-primary">Pause settlements</p>
              <p className="type-12r text-text-secondary">Holds every payout. Customers can still pay you. Needs Owner approval and a code.</p>
            </div>
            <Switch aria-label="Pause settlements" checked={s.paused} onChange={() => modal.open("verify-pause")} />
          </div>
        </div>
      </Card>

      <ViewBankModal open={modal.is("view-bank")} onClose={modal.close} account={target ?? primary} onChange={() => modal.open("add-bank")} />
      <CancelRequestModal open={modal.is("cancel-request")} onClose={modal.close} />
      <AddBankModal open={modal.is("add-bank")} onClose={modal.close} />
      <ViewChequeModal open={modal.is("cheque")} onClose={modal.close} account={target ?? primary} />
      {(target ?? mismatch) && <FixRetryModal open={modal.is("fix-retry")} onClose={modal.close} account={(target ?? mismatch)!} />}
      <EditScheduleModal open={modal.is("schedule")} onClose={modal.close} preset={presetSchedule} />
      <OtpModal
        open={modal.is("verify-pause")}
        onClose={modal.close}
        destination={maskMobile(businessProfile.contact.mobile)}
        onVerified={async () => {
          await setSettlementsPaused(!s.paused);
          modal.close();
          toast.show("changes-saved");
        }}
      />
    </>
  );
}
