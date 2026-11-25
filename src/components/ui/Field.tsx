import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

/** Read-only label/value pair (label 12 medium tertiary, value 14 medium). */
export function Field({ label, children, locked, trailing, muted, className }: { label: string; children: ReactNode; locked?: boolean; trailing?: ReactNode; muted?: boolean; className?: string }) {
  return (
    <div className={cn("flex min-w-px flex-1 flex-col items-start gap-1 overflow-clip", className)}>
      <p className="type-12m text-text-tertiary whitespace-nowrap">{label}</p>
      <div className="flex items-center gap-2">
        <p className={cn("type-14m whitespace-nowrap", muted ? "text-text-secondary" : "text-text-primary")}>{children}</p>
        {locked && <Icon icon={Lock} size={14} className="text-text-tertiary" aria-label="Locked" />}
        {trailing}
      </div>
    </div>
  );
}

export function FieldRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex w-full items-start gap-6 overflow-clip", className)}>{children}</div>;
}
