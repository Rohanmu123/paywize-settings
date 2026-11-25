"use client";

import { Fragment, useState } from "react";
import { Bell, Pencil } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Chip } from "@/components/ui/Chip";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Icon } from "@/components/ui/Icon";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/Toast";
import { CHANNEL_LABEL, CHANNELS, RECIPIENT_STATUS, type Recipient } from "@/data/alerts";
import { cn } from "@/lib/cn";
import { useStore } from "@/lib/store";
import { useModal } from "@/lib/useModal";
import { addRecipient, alertsStore, fixRecipientEmail, resendConsent, setChannel, setSummary, updateRecipient } from "@/services/alerts";
import { FixBouncedModal, RecipientModal } from "./AlertsModals";

const link = "type-12sb cursor-pointer whitespace-nowrap text-primary hover:underline";
const cell = "h-11 align-middle";
const rule = "border-b-[0.5px] border-border";

export function AlertsView() {
  const { recipients, sections, summaries } = useStore(alertsStore);
  const toast = useToast();
  const modal = useModal<"add-recipient" | "edit-recipient" | "fix-bounced">();
  const [showWhy, setShowWhy] = useState(true);
  const target = recipients.find((r) => r.id === modal.target);
  const rowCount = sections.reduce((n, s) => n + 1 + s.events.length, 0);

  const cols: Column<Recipient>[] = [
    { key: "email", header: "Email", render: (r) => r.email },
    { key: "group", header: "Receives", width: 200, render: (r) => r.group },
    { key: "status", header: "Status", width: 190, render: (r) => <Chip tone={RECIPIENT_STATUS[r.status].tone}>{RECIPIENT_STATUS[r.status].label}</Chip> },
    {
      key: "action",
      header: "",
      width: 90,
      align: "right",
      render: (r) =>
        r.status === "confirmed" ? (
          <button type="button" aria-label={`Edit ${r.email}`} className="inline-flex cursor-pointer align-middle text-primary" onClick={() => modal.open("edit-recipient", r.id)}>
            <Icon icon={Pencil} size={16} />
          </button>
        ) : r.status === "awaiting" ? (
          <button
            type="button"
            className={link}
            onClick={async () => {
              await resendConsent();
              toast.show("link-sent");
            }}
          >
            Resend
          </button>
        ) : (
          <button type="button" className={link} onClick={() => modal.open("fix-bounced", r.id)}>Fix</button>
        ),
    },
  ];

  let row = 0;

  return (
    <>
      <PageHeader title="Alerts & recipients" scope="Applies to every service" />

      <Card aria-label="Email recipients">
        <CardHeader icon={Bell} title="Email recipients" action={<Button size="sm" onClick={() => modal.open("add-recipient")}>Add recipient</Button>} />
        <DataTable columns={cols} rows={recipients} rowKey={(r) => r.id} caption="Email recipients" />
        {showWhy && (
          <Alert tone="info" title="Why confirmation?" onDismiss={() => setShowWhy(false)}>
            We send a link to the new address. Alerts start only after the person selects Confirm, so nobody is subscribed without consent.
          </Alert>
        )}
      </Card>

      <Card aria-label="Alert preferences">
        <CardHeader icon={Bell} title="Alert preferences" />
        <table className="w-full table-fixed border-separate border-spacing-0 bg-surface">
          <caption className="sr-only">Alert preferences by channel</caption>
          <colgroup>
            <col />
            {CHANNELS.map((c) => (
              <col key={c} style={{ width: 110 }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className="h-[30px] rounded-tl-2xl bg-background pr-3 pl-4 text-left text-[10px] leading-3 font-semibold text-text-primary uppercase">Event</th>
              {CHANNELS.map((c, i) => (
                <th key={c} scope="col" className={cn("h-[30px] bg-background text-center text-[10px] leading-3 font-semibold text-text-primary uppercase", i === CHANNELS.length - 1 && "rounded-tr-2xl")}>
                  {CHANNEL_LABEL[c]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sections.map((sec) => {
              row += 1;
              return (
                <Fragment key={sec.title}>
                  <tr>
                    <th scope="colgroup" colSpan={CHANNELS.length + 1} className={cn(cell, rule, "bg-background px-4 text-left type-12sb text-primary")}>
                      {sec.title}
                    </th>
                  </tr>
                  {sec.events.map((e) => {
                    row += 1;
                    const last = row === rowCount;
                    return (
                      <tr key={e.id}>
                        <th scope="row" className={cn(cell, !last && rule, "px-4 text-left type-12m text-text-primary")}>
                          {e.label}
                        </th>
                        {CHANNELS.map((c) => {
                          const locked = e.locked?.includes(c);
                          return (
                            <td key={c} className={cn(cell, !last && rule, "text-center")} title={locked ? "Set by Paywize for account security" : undefined}>
                              <span className="flex items-center justify-center">
                                <Checkbox
                                  aria-label={`${e.label} by ${CHANNEL_LABEL[c]}`}
                                  checked={e.channels[c]}
                                  disabled={locked}
                                  onChange={async (v) => {
                                    await setChannel(e.id, c, v);
                                    toast.show("changes-saved");
                                  }}
                                />
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Card aria-label="Summaries">
        <CardHeader icon={Bell} title="Summaries" />
        <div className="flex w-full flex-col gap-3">
          {summaries.map((s) => (
            <div key={s.id} className="flex w-full items-center justify-between gap-4">
              <div className="flex flex-col gap-0.5">
                <p className="type-14sb text-text-primary">{s.title}</p>
                <p className="type-12r text-text-secondary">{s.hint}</p>
              </div>
              <Switch
                aria-label={s.title}
                checked={s.on}
                onChange={async (v) => {
                  await setSummary(s.id, v);
                  toast.show("changes-saved");
                }}
              />
            </div>
          ))}
        </div>
      </Card>

      <RecipientModal
        open={modal.is("add-recipient") || (modal.is("edit-recipient") && !!target)}
        recipient={modal.is("edit-recipient") ? target : undefined}
        onClose={modal.close}
        onSubmit={async (v) => {
          if (modal.is("edit-recipient") && target) {
            await updateRecipient(target.id, { name: v.name, group: v.group });
            modal.close();
            toast.show("changes-saved");
          } else {
            await addRecipient(v);
            modal.close();
            toast.show("link-sent");
          }
        }}
      />
      <FixBouncedModal
        open={modal.is("fix-bounced")}
        recipient={target}
        onClose={modal.close}
        onSubmit={async (email) => {
          if (target) await fixRecipientEmail(target.id, email);
          modal.close();
          toast.show("link-sent");
        }}
      />
    </>
  );
}
