"use client";

import { useState } from "react";
import { CircleX, Copy, Eye, EyeOff, Lock, Pencil, Send } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ServiceScope } from "@/components/layout/ServiceScope";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { CopyButton } from "@/components/ui/CopyButton";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Icon } from "@/components/ui/Icon";
import { OtpModal } from "@/components/ui/OtpModal";
import { TextLink } from "@/components/ui/TextLink";
import { useToast } from "@/components/ui/Toast";
import type { Delivery, Endpoint } from "@/data/webhooks";
import { maskMobileDots } from "@/lib/format";
import { useStore } from "@/lib/store";
import { useModal } from "@/lib/useModal";
import { securityStore } from "@/services/security";
import { downloadDeliveryLog, eventCount, hostOf, resendDelivery, retryEndpoint, rollSecret, saveEndpoint, sendTestEvent, webhooksStore } from "@/services/webhooks";
import { DeliveryDetailModal, EndpointFormModal, RollSecretModal, ViewEndpointModal } from "./WebhooksModals";

type WebhookModal = "add" | "edit" | "view" | "delivery" | "roll" | "reveal";

const link = "type-12sb cursor-pointer whitespace-nowrap text-primary hover:underline";

export function WebhooksView() {
  const { endpoints, deliveries, secret } = useStore(webhooksStore);
  const { mobile } = useStore(securityStore);
  const toast = useToast();
  const modal = useModal<WebhookModal>();
  const [showPaused, setShowPaused] = useState(true);
  const [showRollInfo, setShowRollInfo] = useState(true);
  const [revealed, setRevealed] = useState(false);

  const paused = endpoints.filter((e) => e.status === "paused" && e.failure);
  const endpoint = endpoints.find((e) => e.id === modal.target);
  const delivery = deliveries.find((d) => d.id === modal.target);

  const endpointCols: Column<Endpoint>[] = [
    { key: "url", header: "Endpoint URL", render: (e) => <span className="block truncate">{e.url}</span> },
    { key: "events", header: "Events", width: 100, render: (e) => `${eventCount(e)} events` },
    { key: "rate", header: "Success (24h)", width: 120, render: (e) => e.successRate },
    { key: "status", header: "Status", width: 110, render: (e) => (e.status === "active" ? <Chip tone="success">Active</Chip> : <Chip tone="error">Paused</Chip>) },
    {
      key: "action",
      header: "",
      width: 167,
      align: "right",
      render: (e) =>
        e.status === "paused" ? (
          <button
            type="button"
            className={link}
            onClick={async () => {
              await retryEndpoint(e.id);
              toast.show("request-submitted");
            }}
          >
            Retry {e.pendingEvents} events
          </button>
        ) : (
          <button type="button" aria-label={`View ${e.url}`} className="inline-flex cursor-pointer align-middle text-primary" onClick={() => modal.open("view", e.id)}>
            <Icon icon={Pencil} size={16} />
          </button>
        ),
    },
  ];

  const deliveryCols: Column<Delivery>[] = [
    { key: "event", header: "Event", render: (d) => d.event },
    { key: "endpoint", header: "Endpoint", width: 131, render: (d) => hostOf(endpoints.find((e) => e.id === d.endpointId)?.url ?? "") },
    { key: "response", header: "Response", width: 120, render: (d) => <Chip tone={d.response.tone}>{d.response.label}</Chip> },
    { key: "time", header: "Time", width: 130, render: (d) => d.at },
    { key: "action", header: "", width: 80, align: "right", render: (d) => <button type="button" className={link} onClick={() => modal.open("delivery", d.id)}>Resend</button> },
  ];

  const resend = async () => {
    await resendDelivery();
    modal.close();
    toast.show("request-submitted");
  };

  return (
    <>
      <PageHeader title="Webhooks" actions={<ServiceScope />} />

      {showPaused && paused.length > 0 && (
        <Alert tone="error" icon={CircleX} title={`${paused.length} ${paused.length === 1 ? "endpoint" : "endpoints"} paused after repeated failures`} onDismiss={() => setShowPaused(false)}>
          {paused.map((e) => `${e.url} returned ${e.failure!.code} on ${e.failure!.attempts} attempts. We stopped sending on ${e.failure!.pausedAt}.`).join(" ")} Events are kept for 7 days.
        </Alert>
      )}

      <Card aria-label="Webhook endpoints">
        <CardHeader icon={Send} title="Webhook endpoints" action={<Button size="sm" onClick={() => modal.open("add")}>Add endpoint</Button>} />
        <DataTable columns={endpointCols} rows={endpoints} rowKey={(e) => e.id} caption="Webhook endpoints" />
      </Card>

      <Card aria-label="Recent deliveries">
        <CardHeader icon={Send} title="Recent deliveries" action={<TextLink onClick={() => { downloadDeliveryLog(); toast.show("download-started"); }}>Download log</TextLink>} />
        <DataTable columns={deliveryCols} rows={deliveries} rowKey={(d) => d.id} caption="Recent deliveries" />
      </Card>

      <Card aria-label="Signing secret">
        <CardHeader icon={Lock} title="Signing secret" action={<TextLink onClick={() => modal.open("roll")}>Roll secret</TextLink>} />
        <div className="flex h-11 w-full items-center gap-2.5 overflow-clip rounded-[10px] bg-surface-variant px-3.5">
          <button type="button" className="type-14m min-w-px flex-1 cursor-pointer truncate text-left text-text-secondary" onClick={() => (revealed ? setRevealed(false) : modal.open("reveal"))}>
            {revealed ? secret : `whsec_${"•".repeat(24)}`}
          </button>
          <button type="button" aria-label={revealed ? "Hide secret" : "Reveal secret"} className="cursor-pointer text-text-secondary hover:text-text-primary" onClick={() => (revealed ? setRevealed(false) : modal.open("reveal"))}>
            <Icon icon={revealed ? EyeOff : Eye} size={16} />
          </button>
          {revealed ? (
            <CopyButton value={secret} label="signing secret" />
          ) : (
            <button type="button" aria-label="Reveal to copy" className="cursor-pointer text-text-secondary" onClick={() => modal.open("reveal")}>
              <Icon icon={Copy} size={14} />
            </button>
          )}
        </div>
        {showRollInfo && (
          <Alert tone="info" title="Rolling is safe" onDismiss={() => setShowRollInfo(false)}>
            The old secret keeps working for 24 hours so you can update your server without dropping events.
          </Alert>
        )}
      </Card>

      <EndpointFormModal
        open={modal.is("add") || (modal.is("edit") && !!endpoint)}
        endpoint={modal.is("edit") ? endpoint : undefined}
        onClose={modal.close}
        onSubmit={async (v) => {
          await saveEndpoint({ id: modal.is("edit") ? endpoint?.id : undefined, url: v.url, group: v.group });
          if (v.sendTest) await sendTestEvent();
          modal.close();
          toast.show("changes-saved");
        }}
      />
      <ViewEndpointModal
        open={modal.is("view")}
        endpoint={endpoint}
        onClose={modal.close}
        onSendTest={async () => {
          await sendTestEvent();
          modal.close();
          toast.show("request-submitted");
        }}
        onEdit={() => modal.open("edit", endpoint?.id)}
      />
      <DeliveryDetailModal open={modal.is("delivery")} delivery={delivery} onClose={modal.close} onResend={resend} />
      <RollSecretModal
        open={modal.is("roll")}
        onClose={modal.close}
        onConfirm={async () => {
          await rollSecret();
          setRevealed(false);
          modal.close();
          toast.show("changes-saved");
        }}
      />
      <OtpModal
        open={modal.is("reveal")}
        onClose={modal.close}
        width={364}
        destination={maskMobileDots(mobile)}
        onVerified={() => {
          setRevealed(true);
          modal.close();
        }}
      />
    </>
  );
}

