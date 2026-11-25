import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

export type AlertTone = "warning" | "error" | "info" | "success" | "brand";

const toneClass: Record<AlertTone, string> = {
  warning: "bg-warning-container text-on-warning-container",
  error: "bg-error-container text-on-error-container",
  info: "bg-info-container text-on-info-container",
  success: "bg-success-container text-on-success-container",
  brand: "bg-primary-container text-on-primary-container",
};

const defaultIcon: Partial<Record<AlertTone, LucideIcon>> = { warning: CircleAlert, info: Info, success: CircleCheck, brand: Info };

/** Figma "Alert": 16 radius, 16/12 padding, 14 bold title + 12 regular body. */
export function Alert({ tone = "warning", title, children, icon, showIcon = true, action, onDismiss, className }: { tone?: AlertTone; title?: ReactNode; children?: ReactNode; icon?: LucideIcon; showIcon?: boolean; action?: ReactNode; onDismiss?: () => void; className?: string }) {
  const glyph = icon ?? defaultIcon[tone];
  return (
    <div role={tone === "error" ? "alert" : "note"} className={cn("flex w-full shrink-0 items-center gap-3 overflow-clip rounded-2xl px-4 py-3", toneClass[tone], className)}>
      {showIcon && glyph && <Icon icon={glyph} size={20} strokeWidth={1.5} className={tone === "info" ? "text-info" : undefined} />}
      <div className="flex min-w-px flex-1 flex-col items-start gap-1.5">
        {title && <p className="type-14b">{title}</p>}
        {children && <div className="type-12r">{children}</div>}
      </div>
      {action}
      {onDismiss && (
        <button type="button" aria-label="Dismiss" onClick={onDismiss}>
          <Icon icon={X} size={16} strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
}
