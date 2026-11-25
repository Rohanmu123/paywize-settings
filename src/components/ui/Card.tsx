import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

/** White 24px-radius section card used for every settings block. */
export function Card({ children, className, padding = 20, as: Tag = "section", ...rest }: { children: ReactNode; className?: string; padding?: 16 | 20; as?: "section" | "div"; "aria-label"?: string; "data-testid"?: string }) {
  return (
    <Tag className={cn("flex w-full shrink-0 flex-col items-start gap-4 rounded-3xl bg-surface", padding === 20 ? "p-5" : "p-4", className)} {...rest}>
      {children}
    </Tag>
  );
}

/** "Card header": 18px brand icon + 14 semibold title, optional subtitle, right-aligned action. */
export function CardHeader({ icon, title, subtitle, action, className }: { icon?: LucideIcon; title: ReactNode; subtitle?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex w-full items-center justify-between gap-4", className)}>
      <div className="flex min-w-0 items-center gap-2">
        {icon && <Icon icon={icon} size={18} className="text-primary" />}
        <div className="flex min-w-0 flex-col items-start gap-1">
          <h2 className="type-14sb text-text-primary whitespace-nowrap">{title}</h2>
          {subtitle && <p className="type-12r text-text-secondary">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/** Grey inset panel (Surface/Background, 24 radius, 16 padding). */
export function Panel({ children, className, row }: { children: ReactNode; className?: string; row?: boolean }) {
  return (
    <div className={cn("flex w-full shrink-0 overflow-clip rounded-3xl bg-background p-4", row ? "flex-row items-center gap-3" : "flex-col items-start gap-4", className)}>
      {children}
    </div>
  );
}

export function Divider({ faint, className }: { faint?: boolean; className?: string }) {
  return <div role="separator" className={cn("h-px w-full shrink-0 bg-border", faint && "opacity-50", className)} />;
}
