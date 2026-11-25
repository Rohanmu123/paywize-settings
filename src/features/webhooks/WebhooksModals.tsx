"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Chip } from "@/components/ui/Chip";
import { Modal, ModalActions } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { TextField } from "@/components/ui/TextField";
import { EVENT_GROUPS, type Delivery, type Endpoint, type EventGroup } from "@/data/webhooks";
import { eventCount, shortUrl, validateEndpointUrl } from "@/services/webhooks";

export function EndpointFormModal({ open, endpoint, onClose, onSubmit }: { open: boolean; endpoint?: Endpoint; onClose: () => void; onSubmit: (v: { url: string; group: EventGroup; sendTest: boolean }) => void }) {
  const [url, setUrl] = useState("https://");
  const [group, setGroup] = useState<EventGroup>("payments-refunds");
  const [sendTest, setSendTest] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    setUrl(endpoint?.url ?? "https://");
    setGroup(endpoint?.group ?? "payments-refunds");
    setSendTest(!endpoint);
    setError(null);
  }, [open, endpoint]);
  return (
    <Modal open={open} onClose={onClose} width={364} title={endpoint ? "Edit webhook endpoint" : "Add webhook endpoint"} description="We send a signed POST to this address." testId="endpoint-form-modal">
      <TextField label="Endpoint URL" type="url" inputMode="url" placeholder="https://" containerClassName="w-full" value={url} error={error} onChange={(e) => { setUrl(e.target.value); setError(null); }} />
      <Select label="Events" containerClassName="w-full" value={group} onChange={(e) => setGroup(e.target.value as EventGroup)} options={Object.entries(EVENT_GROUPS).map(([value, g]) => ({ value, label: g.label }))} />
      <Checkbox checked={sendTest} onChange={setSendTest} label="Send a test event after saving" />
      {!endpoint && <p className="type-12r text-text-secondary">You get the signing secret once the endpoint is saved.</p>}
      <ModalActions>
        <Button variant="outline" block onClick={onClose}>Cancel</Button>
        <Button
          block
          onClick={() => {
            const e = validateEndpointUrl(url, endpoint?.id);
            if (e) return setError(e);
            onSubmit({ url, group, sendTest });
          }}
        >
          {endpoint ? "Save changes" : "Add endpoint"}
        </Button>
      </ModalActions>
    </Modal>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-px flex-1 flex-col gap-0.5">
      <p className="type-12r text-text-secondary">{label}</p>
      <p className="type-14m text-text-primary">{value}</p>
    </div>
  );
}

const SHOWN_EVENTS = 4;

export function ViewEndpointModal({ open, endpoint, onClose, onSendTest, onEdit }: { open: boolean; endpoint?: Endpoint; onClose: () => void; onSendTest: () => void; onEdit: () => void }) {
  const [all, setAll] = useState(false);
  useEffect(() => {
    if (open) setAll(false);
  }, [open]);
  if (!endpoint) return null;
  const events = EVENT_GROUPS[endpoint.group].events;
  const shown = all ? events : events.slice(0, SHOWN_EVENTS);
  return (
    <Modal
      open={open}
      onClose={onClose}
      width={565}
      testId="view-endpoint-modal"
      title={
        <span className="flex items-center gap-2.5">
          <span className="truncate">{shortUrl(endpoint.url)}</span>
          {endpoint.status === "active" ? <Chip tone="success">Active</Chip> : <Chip tone="error">Paused</Chip>}
        </span>
      }
      description={`Added ${endpoint.addedOn} by ${endpoint.addedBy}`}
    >
      <div className="flex w-full flex-col gap-3.5">
        <div className="flex w-full gap-4">
          <Detail label="Success rate (24h)" value={endpoint.successRate} />
          <Detail label="Events subscribed" value={`${eventCount(endpoint)} events`} />
        </div>
        <div className="flex w-full gap-4">
          <Detail label="Last delivery" value={endpoint.lastDelivery} />
          <Detail label="Signing secret" value="whsec_••••••••••••" />
        </div>
      </div>
      <p className="type-12sb text-text-primary">Subscribed events</p>
      <div className="flex w-full flex-wrap gap-1.5">
        {shown.map((e) => (
          <Chip key={e} tone="neutral">{e}</Chip>
        ))}
        {events.length > SHOWN_EVENTS && (
          <button type="button" className="cursor-pointer" onClick={() => setAll((v) => !v)}>
            <Chip tone="brand">{all ? "Show less" : `+${events.length - SHOWN_EVENTS} more`}</Chip>
          </button>
        )}
      </div>
      <Alert tone="info" title="Failed deliveries retry for 24 hours">
        We try 5 times, with longer gaps each time.
      </Alert>
      <ModalActions>
        <Button variant="outline" block onClick={onSendTest}>Send test event</Button>
        <Button block onClick={onEdit}>Edit endpoint</Button>
      </ModalActions>
    </Modal>
  );
}

function CodeBlock({ label, children }: { label: string; children: string }) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      <p className="type-12sb text-text-primary">{label}</p>
      <pre className="type-12r w-full overflow-x-auto rounded-2xl bg-container p-3 font-[inherit] whitespace-pre-wrap text-text-primary">{children}</pre>
    </div>
  );
}

export function DeliveryDetailModal({ open, delivery, onClose, onResend }: { open: boolean; delivery?: Delivery; onClose: () => void; onResend: () => void }) {
  if (!delivery) return null;
  return (
    <Modal
      open={open}
      onClose={onClose}
      width={565}
      testId="delivery-detail-modal"
      title={
        <span className="flex items-center gap-2.5">
          {delivery.event}
          <Chip tone={delivery.response.tone}>{delivery.response.label}</Chip>
        </span>
      }
      description={`${delivery.at} · ${delivery.attempt} · ${delivery.ms.toLocaleString("en-IN")} ms`}
    >
      <CodeBlock label="Request">{delivery.request}</CodeBlock>
      <CodeBlock label="Your server replied">{delivery.reply}</CodeBlock>
      <ModalActions>
        <Button variant="outline" block onClick={onClose}>Close</Button>
        <Button block onClick={onResend}>Resend</Button>
      </ModalActions>
    </Modal>
  );
}

export function RollSecretModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  const [ack, setAck] = useState(false);
  useEffect(() => {
    if (open) setAck(false);
  }, [open]);
  return (
    <Modal open={open} onClose={onClose} width={478} title="Roll signing secret" description="Old and new secrets both work for 24 hours." testId="roll-secret-modal">
      <Alert tone="info" title="Update your endpoint">
        Verify signatures with the new secret within 24 hours.
      </Alert>
      <Checkbox checked={ack} onChange={setAck} label="I understand the old secret expires in 24 hours" />
      <ModalActions>
        <Button variant="outline" block onClick={onClose}>Cancel</Button>
        <Button block disabled={!ack} onClick={onConfirm}>Roll secret</Button>
      </ModalActions>
    </Modal>
  );
}
