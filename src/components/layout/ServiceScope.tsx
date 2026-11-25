"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { Switch } from "@/components/ui/Switch";
import { SERVICES_SCOPE } from "@/data/settlement";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/routes";
import { createStore, useStore } from "@/lib/store";

/** Shared page-header scope: which service the page edits + test mode. */
export const scopeStore = createStore<{ service: (typeof SERVICES_SCOPE)[number]; testMode: boolean }>({ service: "Payment Gateway", testMode: false });

export function ServiceScope() {
  const scope = useStore(scopeStore);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const off = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", off);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", off);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div className="flex items-center gap-3">
      <div className="relative" ref={ref}>
        <button type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-[20px] border border-border px-3 py-2">
          <span className={cn("size-2 rounded-full", scope.testMode ? "bg-warning-container ring-1 ring-on-warning-container" : "bg-success")} />
          <span className="type-14m whitespace-nowrap text-text-primary">{scope.service}</span>
          <Icon icon={ChevronDown} size={16} className="text-text-primary" />
        </button>
        {open && (
          <ul role="listbox" aria-label="Service" className="absolute top-11 right-0 z-20 flex w-52 flex-col rounded-2xl border border-border bg-surface p-1 shadow-toast">
            {SERVICES_SCOPE.map((s) => (
              <li key={s} role="option" aria-selected={s === scope.service}>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    // Payouts is not activated yet, so it has its own activation page.
                    if (s === "Payouts") return router.push(ROUTES.payouts);
                    scopeStore.set((p) => ({ ...p, service: s }));
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left type-14r text-text-primary hover:bg-background"
                >
                  {s}
                  {s === scope.service && <Icon icon={Check} size={16} className="text-primary" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <span className="type-12m whitespace-nowrap text-text-secondary">Test mode</span>
      <Switch aria-label="Test mode" checked={scope.testMode} onChange={(v) => scopeStore.set((p) => ({ ...p, testMode: v }))} />
    </div>
  );
}
