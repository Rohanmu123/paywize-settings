"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CircleCheck, Info, X } from "lucide-react";
import { Icon } from "./Icon";
import { cn } from "@/lib/cn";

/** The six "Toast / …" overlays in the file. */
export const TOASTS = {
  "changes-saved": { title: "Changes saved", body: "Your update is live.", tone: "success" },
  "request-submitted": { title: "Request submitted", body: "We will update you by email.", tone: "success" },
  "download-started": { title: "Download started", body: "Your file will be ready in a moment.", tone: "info" },
  "invitation-sent": { title: "Invitation sent", body: "They will get an email with a link.", tone: "success" },
  "signed-out": { title: "Signed out", body: "That device no longer has access.", tone: "success" },
  "link-sent": { title: "Link sent", body: "Check the inbox for the next step.", tone: "success" },
} as const;

export type ToastKind = keyof typeof TOASTS;
export const TOAST_DURATION_MS = 3000;

type Ctx = { show: (kind: ToastKind) => void };
const ToastContext = createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<{ kind: ToastKind; key: number } | null>(null);
  const show = useCallback((kind: ToastKind) => setCurrent({ kind, key: Date.now() }), []);

  useEffect(() => {
    if (!current) return;
    const t = setTimeout(() => setCurrent(null), TOAST_DURATION_MS);
    return () => clearTimeout(t);
  }, [current]);

  const value = useMemo(() => ({ show }), [show]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      {current && <ToastView key={current.key} kind={current.kind} onClose={() => setCurrent(null)} />}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

export function ToastView({ kind, onClose }: { kind: ToastKind; onClose: () => void }) {
  const t = TOASTS[kind];
  const success = t.tone === "success";
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center">
      <div
        role="status"
        aria-live="polite"
        data-testid="toast"
        className={cn(
          "pointer-events-auto flex w-[340px] items-center gap-3 overflow-clip rounded-xl border border-border p-3 shadow-toast animate-[fade_200ms_ease-out]",
          success ? "bg-success-container" : "bg-info-container",
        )}
      >
        <Icon icon={success ? CircleCheck : Info} size={20} className={success ? "text-success" : "text-info"} />
        <div className="flex min-w-px flex-1 flex-col items-start gap-1 whitespace-nowrap">
          <p className="type-14sb text-text-primary">{t.title}</p>
          <p className="type-12r text-text-secondary">{t.body}</p>
        </div>
        <button type="button" aria-label="Dismiss" onClick={onClose} className="text-text-primary">
          <Icon icon={X} size={16} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
