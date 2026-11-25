"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Clock, X, type LucideIcon } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Chip, type ChipTone } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { ROUTES } from "@/lib/routes";
import { createStore, useStore } from "@/lib/store";

type ReqState = "done" | "action" | "progress";
const REQ_UI: Record<ReqState, { icon: LucideIcon; color: string; chip: string; tone: ChipTone }> = {
  done: { icon: Check, color: "text-success", chip: "Done", tone: "success" },
  action: { icon: X, color: "text-error", chip: "Action needed", tone: "error" },
  progress: { icon: Clock, color: "text-[#f5a524]", chip: "In progress", tone: "warning" },
};

export const PAYOUT_REQUIREMENTS: { id: string; title: string; detail: string; state: ReqState }[] = [
  { id: "kyc", title: "Business KYC verified", detail: "Done", state: "done" },
  { id: "cheque", title: "Cancelled cheque approved", detail: "Rejected. Upload a clear photo in Compliance & KYC.", state: "action" },
  { id: "payments", title: "10 successful payments on Payment Gateway", detail: "3 of 10 so far", state: "progress" },
];

export const payoutsStore = createStore({ activationRequested: false });

export function PayoutsView() {
  const router = useRouter();
  const toast = useToast();
  const { activationRequested } = useStore(payoutsStore);
  const [showInfo, setShowInfo] = useState(true);

  return (
    <>
      <section className="flex w-full flex-col items-start gap-4 overflow-clip rounded-3xl bg-surface p-4" aria-label="Payouts">
        <div className="flex w-full items-center justify-between">
          <h2 className="type-14sb text-text-primary">Payouts</h2>
          <div className="flex items-center gap-2 rounded-[20px] border border-border px-3 py-2" aria-label="Service: Payouts, inactive">
            <span className="size-2 rounded-full bg-text-secondary" />
            <span className="type-14m text-text-primary">Payouts</span>
            <Chip tone="neutral">Inactive</Chip>
            <Icon icon={ChevronDown} size={16} className="text-text-primary" />
          </div>
        </div>
        {showInfo && (
          <Alert tone="info" title="Activation takes 1–2 working days" onDismiss={() => setShowInfo(false)}>
            We email Owner and Admin once every step is done. You can switch to test mode to try Payouts before then.
          </Alert>
        )}
      </section>

      <section className="flex w-full flex-col items-center gap-3.5 overflow-clip rounded-3xl bg-surface px-6 pt-16 pb-[120px]" aria-label="Activate Payouts">
        <h1 className="text-center type-20sb text-text-primary">Activate Payouts to send money from your balance</h1>
        <p className="w-[520px] text-center type-14m text-text-secondary">Keys, webhooks, limits and a settlement account for Payouts unlock after activation. Finish the steps below.</p>
        <ul className="flex w-[560px] flex-col overflow-clip rounded-3xl border border-border-variant" aria-label="Activation steps">
          {PAYOUT_REQUIREMENTS.map((r, i) => {
            const ui = REQ_UI[r.state];
            return (
              <li key={r.id} className={i > 0 ? "border-t border-border-variant" : undefined}>
                <div className="flex w-full items-center gap-3 p-4">
                  <Icon icon={ui.icon} size={20} className={ui.color} />
                  <div className="flex min-w-px flex-1 flex-col items-start gap-0.5 whitespace-nowrap">
                    <p className="type-14sb text-text-primary">{r.title}</p>
                    <p className="type-12r text-text-secondary">{r.detail}</p>
                  </div>
                  <Chip tone={ui.tone}>{ui.chip}</Chip>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="flex items-start gap-3">
          <button
            type="button"
            disabled={activationRequested}
            onClick={() => {
              payoutsStore.set({ activationRequested: true });
              toast.show("request-submitted");
            }}
            className="flex h-10 items-center justify-center rounded-[20px] bg-background px-6 type-14sb whitespace-nowrap text-text-disabled"
          >
            {activationRequested ? "Activation requested" : "Request activation"}
          </button>
          <Button variant="dark" size="lg" onClick={() => router.push(ROUTES.kyc)}>
            Go to Compliance &amp; KYC
          </Button>
        </div>
      </section>
    </>
  );
}
