"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useMounted } from "@/lib/useMounted";
import { Icon } from "./Icon";

/** The file has three modal widths: "Modal 364", "Modal 478", "Modal 565". */
export type ModalWidth = 364 | 478 | 565;

const widthClass: Record<ModalWidth, string> = {
  364: "w-[364px]",
  478: "w-[478px]",
  565: "w-[565px]",
};

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  width?: ModalWidth;
  children?: ReactNode;
  /** Hide the close (×) icon — used by "Key pair generated". */
  hideClose?: boolean;
  testId?: string;
  className?: string;
};

function useLockScroll(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);
}

/** Overlay + positioned panel shared by every pop-up variant. */
export function ModalShell({
  open,
  onClose,
  width = 478,
  labelledBy,
  describedBy,
  testId,
  className,
  children,
}: {
  open: boolean;
  onClose: () => void;
  width?: ModalWidth;
  labelledBy?: string;
  describedBy?: string;
  testId?: string;
  className?: string;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const mounted = useMounted();
  useLockScroll(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const first = panelRef.current?.querySelector<HTMLElement>("input:not([disabled]):not([readonly]),textarea:not([readonly]),select");
    (first ?? panelRef.current)?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div data-testid="modal-scrim" aria-hidden className="fixed inset-0 bg-scrim animate-[fade_200ms_ease-out]" onClick={onClose} />
      <div className="pointer-events-none relative flex min-h-full justify-center px-4 pt-[88px] pb-10">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          tabIndex={-1}
          data-testid={testId}
          className={cn("pointer-events-auto relative flex h-fit max-w-full flex-col items-start overflow-clip rounded-3xl bg-surface shadow-modal outline-none", widthClass[width], className)}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/**
 * Standard pop-up: pinned 88px from the top over a #141233/50% scrim, exactly
 * like every "Pop-up v2.4-B" frame. Scrim click, × and Escape close it.
 */
export function Modal({ open, onClose, title, description, width = 478, children, hideClose, testId, className }: ModalProps) {
  const titleId = useId();
  const descId = useId();
  return (
    <ModalShell open={open} onClose={onClose} width={width} labelledBy={titleId} describedBy={description ? descId : undefined} testId={testId} className={cn("gap-4 p-5", className)}>
      <div className="flex w-full items-start justify-between gap-3">
        <div className="flex min-w-px flex-1 flex-col items-start gap-1">
          <h2 id={titleId} className="type-18sb text-text-primary">
            {title}
          </h2>
          {description && (
            <p id={descId} className="type-12r text-text-secondary">
              {description}
            </p>
          )}
        </div>
        {!hideClose && (
          <button type="button" aria-label="Close" onClick={onClose} className="shrink-0 text-text-primary">
            <Icon icon={X} size={20} />
          </button>
        )}
      </div>
      {children}
    </ModalShell>
  );
}

/** Footer row of a modal: buttons share width equally, 12px gap. */
export function ModalActions({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex w-full items-start gap-3", className)}>{children}</div>;
}
