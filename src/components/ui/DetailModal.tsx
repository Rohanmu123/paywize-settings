"use client";

import { useId, type ReactNode } from "react";
import { X, type LucideIcon } from "lucide-react";
import { Icon } from "./Icon";
import { ModalShell, type ModalWidth } from "./Modal";

/**
 * "View …" pop-up layout: icon tile + title/meta + chip header, hairline
 * dividers (#e5e5ed), padded body and a footer row of buttons.
 */
export function DetailModal({
  open,
  onClose,
  icon,
  title,
  meta,
  chip,
  children,
  footer,
  width = 565,
  testId,
}: {
  open: boolean;
  onClose: () => void;
  icon: LucideIcon;
  title: ReactNode;
  meta?: ReactNode;
  chip?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: ModalWidth;
  testId?: string;
}) {
  const titleId = useId();
  return (
    <ModalShell open={open} onClose={onClose} width={width} labelledBy={titleId} testId={testId}>
      <div className="flex w-full items-center gap-3 px-6 pt-[18px] pb-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-background">
          <Icon icon={icon} size={20} className="text-text-primary" />
        </span>
        <div className="flex flex-col items-start gap-0.5 whitespace-nowrap">
          <h2 id={titleId} className="type-14sb text-text-primary">
            {title}
          </h2>
          {meta && <p className="type-12r text-text-secondary">{meta}</p>}
        </div>
        {chip}
        <span className="h-px min-w-px flex-1" />
        <button type="button" aria-label="Close" onClick={onClose} className="shrink-0 text-text-secondary">
          <Icon icon={X} size={20} />
        </button>
      </div>
      <div className="h-px w-full shrink-0 bg-[#e5e5ed]" />
      <div className="flex w-full flex-col items-start gap-5 overflow-clip p-6">{children}</div>
      {footer && (
        <>
          <div className="h-px w-full shrink-0 bg-[#e5e5ed]" />
          <div className="flex w-full items-start gap-3 px-6 py-4">{footer}</div>
        </>
      )}
    </ModalShell>
  );
}

/** "DETAILS" block: 10px caps heading and a two-column grid of label/value pairs. */
export function DetailGrid({ heading = "DETAILS", items }: { heading?: string; items: { label: string; value: ReactNode }[] }) {
  const rows: { label: string; value: ReactNode }[][] = [];
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));
  return (
    <div className="flex w-full flex-col items-start gap-3.5 whitespace-nowrap">
      <p className="text-[10px] leading-[14px] font-semibold text-text-primary">{heading}</p>
      {rows.map((row, i) => (
        <div key={i} className="flex w-full items-start gap-3.5">
          {row.map((it) => (
            <div key={it.label} className="flex min-w-px flex-1 flex-col items-start gap-0.5">
              <p className="type-12r text-text-secondary">{it.label}</p>
              <div className="type-14sb text-text-primary">{it.value}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Stylised document thumbnail used in "View document" / "View cheque". */
export function DocPreview({ height = 245 }: { height?: number }) {
  const lines = [145, 139.2, 146.16, 116, 143.84, 87];
  const tail = [139.2, 121.8, 145, 92.8];
  return (
    <div className="flex w-full items-center justify-center overflow-clip rounded-[14px] bg-background p-6" style={{ height }} aria-label="Document preview" role="img">
      <div className="flex flex-col items-start gap-[5.8px] rounded-[3.48px] bg-white p-[13.92px] drop-shadow-[0px_4.64px_5.8px_rgba(26,20,77,0.12)]">
        <div className="flex w-full items-center gap-[4.64px]">
          <span className="size-[12.76px] rounded-full bg-primary" />
          <span className="h-[4.64px] w-[52.2px] rounded-[1.74px] bg-[#ccc7f2]" />
        </div>
        <span className="h-[6.96px] w-[104.4px] rounded-[1.74px] bg-[#ccc7f2]" />
        {lines.map((w, i) => (
          <span key={i} className="h-[4.64px] rounded-[1.74px] bg-background" style={{ width: w }} />
        ))}
        <div className="flex w-full flex-col items-start gap-[4.64px] rounded-[2.32px] bg-background p-[5.8px]">
          {[116, 133.4, 104.4].map((w, i) => (
            <span key={i} className="h-[4.06px] rounded-[1.74px] bg-background" style={{ width: w }} />
          ))}
        </div>
        {tail.map((w, i) => (
          <span key={i} className="h-[4.64px] rounded-[1.74px] bg-background" style={{ width: w }} />
        ))}
      </div>
    </div>
  );
}
