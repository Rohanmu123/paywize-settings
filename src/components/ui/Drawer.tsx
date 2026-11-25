"use client";

import { useEffect, useId, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { useMounted } from "@/lib/useMounted";

/** Right-hand drawer (480px, 12px inset, 24 radius) — "Drawer v2.4-B". */
export function Drawer({ open, onClose, label, children, className }: { open: boolean; onClose: () => void; label: string; children: ReactNode; className?: string }) {
  const id = useId();
  const mounted = useMounted();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;
  return createPortal(
    <div className="fixed inset-0 z-50">
      <div data-testid="drawer-scrim" aria-hidden className="absolute inset-0 bg-scrim" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={label}
        id={id}
        className={cn("absolute top-3 right-3 bottom-3 flex w-[480px] flex-col overflow-y-auto rounded-3xl bg-surface shadow-drawer", className)}
      >
        {children}
      </aside>
    </div>,
    document.body,
  );
}
