"use client";

import { Fragment, useState } from "react";
import { IdCard, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ServiceScope } from "@/components/layout/ServiceScope";
import { Alert } from "@/components/ui/Alert";
import { Card, CardHeader } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { DataTable } from "@/components/ui/DataTable";
import { Switch } from "@/components/ui/Switch";
import { TextLink } from "@/components/ui/TextLink";
import { useToast } from "@/components/ui/Toast";
import { LIMIT_STATUS, type LimitRow, type PaymentMethodRow } from "@/data/payments";
import { formatINR } from "@/lib/format";
import { useStore } from "@/lib/store";
import { useModal } from "@/lib/useModal";
import { paymentsStore, setPassFee, toggleMethod } from "@/services/payments";
import { CancelLimitModal, InternationalCardsModal, LimitIncreaseModal, RequestAccessModal, type PaymentsModal } from "./PaymentMethodsModals";

const money = (v: number | string | null) => (v === null ? "—" : typeof v === "number" ? formatINR(v, { decimals: 0 }) : v);

export function PaymentMethodsView() {
  const s = useStore(paymentsStore);
  const toast = useToast();
  const modal = useModal<PaymentsModal>();
  const [showInfo, setShowInfo] = useState(true);
  const [methodError, setMethodError] = useState<string | null>(null);

  const trailing = (m: PaymentMethodRow) => {
    switch (m.state) {
      case "on":
      case "off":
        return (
          <Switch
            aria-label={m.name}
            checked={m.state === "on"}
            onChange={async (on) => {
              try {
                setMethodError(null);
                await toggleMethod(m.id, on);
                toast.show("changes-saved");
              } catch (e) {
                setMethodError((e as Error).message);
              }
            }}
          />
        );
      case "not-enabled":
        return (
          <div className="flex items-center gap-2.5">
            <Chip tone="neutral">Not enabled</Chip>
            <TextLink onClick={() => modal.open("request-access", m.id)}>Request access</TextLink>
          </div>
        );
      case "requested":
      case "review":
        return <Chip tone="warning">Under review</Chip>;
      case "unavailable":
        return <Chip tone="neutral">Unavailable</Chip>;
    }
  };

  const limitAction = (l: LimitRow) => {
    if (l.id === "intl") return l.status === "needs-docs" ? <TextLink onClick={() => modal.open("intl-cards")}>Start</TextLink> : null;
    if (l.status === "review")
      return (
        <button type="button" className="type-12m text-error hover:underline" onClick={() => modal.open("cancel-limit", l.id)}>
          Cancel request
        </button>
      );
    return <TextLink onClick={() => modal.open("limit-increase", l.id)}>Request increase</TextLink>;
  };

  const methodTarget = s.methods.find((m) => m.id === modal.target) ?? s.methods.find((m) => m.state === "not-enabled") ?? s.methods[3]!;
  const limitTarget = s.limits.find((l) => l.id === modal.target) ?? s.limits[0]!;

  return (
    <>
      <PageHeader title="Payment methods & limits" actions={<ServiceScope />} />

      <Card aria-label="Payment methods">
        <CardHeader icon={IdCard} title="Payment methods" />
        <div className="flex w-full flex-col items-start gap-3">
          {s.methods.map((m, i) => (
            <Fragment key={m.id}>
              {i > 0 && <div className="h-px w-full bg-border-variant" />}
              <div className="flex w-full items-center justify-between" data-testid={`method-${m.id}`}>
                <div className="flex flex-col items-start gap-0.5 whitespace-nowrap">
                  <p className="type-14sb text-text-primary">{m.name}</p>
                  <p className="type-12r text-text-secondary">{m.detail}</p>
                </div>
                {trailing(m)}
              </div>
            </Fragment>
          ))}
          {methodError && <p className="type-12r text-error" role="alert">{methodError}</p>}
        </div>
      </Card>

      <Card aria-label="Limits">
        <CardHeader icon={IdCard} title="Limits" />
        <DataTable
          caption="Limits"
          rows={s.limits}
          rowKey={(l) => l.id}
          columns={[
            { key: "limit", header: "Limit", render: (l) => l.name },
            { key: "current", header: "Current", width: 150, render: (l) => money(l.current) },
            { key: "requested", header: "Requested", width: 150, render: (l) => money(l.requested) },
            { key: "status", header: "Status", width: 240, render: (l) => <Chip tone={LIMIT_STATUS[l.status].tone}>{LIMIT_STATUS[l.status].label}</Chip> },
            { key: "action", header: <span className="sr-only">Action</span>, width: 170, align: "right", render: limitAction },
          ]}
        />
        {showInfo && (
          <Alert tone="info" title="Most requests take 2 working days" onDismiss={() => setShowInfo(false)}>
            Limits above ₹40 lakh a month need a verified turnover declaration. Upload it under Compliance &amp; KYC.
          </Alert>
        )}
      </Card>

      <Card aria-label="Pass processing fee to customers">
        <CardHeader
          icon={ShieldCheck}
          title={<span className="leading-[18px]">Pass processing fee to customers</span>}
          action={
            <Switch
              aria-label="Pass processing fee to customers"
              checked={s.passFee}
              onChange={async (v) => {
                await setPassFee(v);
                toast.show("changes-saved");
              }}
            />
          }
        />
      </Card>

      <RequestAccessModal open={modal.is("request-access")} onClose={modal.close} method={methodTarget} />
      <LimitIncreaseModal open={modal.is("limit-increase")} onClose={modal.close} limit={limitTarget} />
      <CancelLimitModal open={modal.is("cancel-limit")} onClose={modal.close} limit={s.limits.find((l) => l.id === modal.target) ?? s.limits.find((l) => l.status === "review") ?? limitTarget} />
      <InternationalCardsModal open={modal.is("intl-cards")} onClose={modal.close} />
    </>
  );
}
