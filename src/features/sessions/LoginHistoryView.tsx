"use client";

import { Clock } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Modal, ModalActions } from "@/components/ui/Modal";
import { TextLink } from "@/components/ui/TextLink";
import { useToast } from "@/components/ui/Toast";
import { LOGIN_HISTORY, type LoginEvent, type Session } from "@/data/sessions";
import { useStore } from "@/lib/store";
import { useModal } from "@/lib/useModal";
import { downloadLoginHistory, sessionsStore, signOutOtherSessions, signOutSession } from "@/services/sessions";

export function LoginHistoryView() {
  const sessions = useStore(sessionsStore);
  const toast = useToast();
  const modal = useModal<"sign-out-all">();
  const others = sessions.filter((s) => !s.current).length;

  const sessionCols: Column<Session>[] = [
    {
      key: "device",
      header: "Device",
      render: (s) => (
        <span className="flex items-center gap-2">
          {s.device}
          {s.current && <Chip tone="success">This device</Chip>}
        </span>
      ),
    },
    { key: "location", header: "Location", width: 150, render: (s) => s.location },
    { key: "ip", header: "IP address", width: 130, render: (s) => s.ip },
    { key: "last", header: "Last active", width: 110, render: (s) => s.lastActive },
    {
      key: "action",
      header: "",
      width: 100,
      align: "right",
      render: (s) =>
        s.current ? null : (
          <button
            type="button"
            className="type-12m cursor-pointer text-error hover:underline"
            onClick={async () => {
              await signOutSession(s.id);
              toast.show("signed-out");
            }}
          >
            Sign out
          </button>
        ),
    },
  ];

  const historyCols: Column<LoginEvent>[] = [
    { key: "user", header: "User", render: (e) => e.user },
    { key: "at", header: "Date & time", width: 170, render: (e) => e.at },
    { key: "method", header: "Method", width: 130, render: (e) => e.method },
    { key: "ip", header: "IP address", width: 130, render: (e) => e.ip },
    {
      key: "result",
      header: "Result",
      width: 103,
      render: (e) => (e.result === "success" ? <Chip tone="success">Success</Chip> : <Chip tone="error">{`Failed ×${e.attempts ?? 1}`}</Chip>),
    },
  ];

  return (
    <>
      <PageHeader title="Login & history" scope="Applies to every service" />

      <Card aria-label="Active sessions">
        <CardHeader icon={Clock} title="Active sessions" action={<TextLink disabled={others === 0} onClick={() => modal.open("sign-out-all")}>Sign out all other devices</TextLink>} />
        <DataTable columns={sessionCols} rows={sessions} rowKey={(s) => s.id} caption="Active sessions" />
      </Card>

      <Card aria-label="Login history">
        <CardHeader
          icon={Clock}
          title="Login history"
          action={
            <TextLink
              onClick={() => {
                downloadLoginHistory();
                toast.show("download-started");
              }}
            >
              Download CSV
            </TextLink>
          }
        />
        <DataTable columns={historyCols} rows={LOGIN_HISTORY} rowKey={(e) => e.id} caption="Login history" />
      </Card>

      <Modal open={modal.is("sign-out-all")} onClose={modal.close} width={478} title="Sign out all other devices?" description="You stay signed in on this device." testId="sign-out-all-modal">
        <Alert tone="warning" title={`${others} ${others === 1 ? "device" : "devices"} will be signed out`}>
          They need your password and a code to sign in again.
        </Alert>
        <ModalActions>
          <Button variant="outline" block onClick={modal.close}>Cancel</Button>
          <Button
            variant="danger"
            block
            onClick={async () => {
              await signOutOtherSessions();
              modal.close();
              toast.show("signed-out");
            }}
          >
            Sign out all
          </Button>
        </ModalActions>
      </Modal>
    </>
  );
}
