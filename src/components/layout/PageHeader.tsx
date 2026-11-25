import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

/**
 * White "Page header" card: 14 semibold title (optionally with a back chevron
 * and a "· subtitle"), scope text or actions on the right, optional body.
 */
export function PageHeader({ title, subtitle, backHref, scope, actions, children, className }: { title: ReactNode; subtitle?: ReactNode; backHref?: string; scope?: ReactNode; actions?: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <section className={cn("flex w-full shrink-0 flex-col items-start gap-4 overflow-clip rounded-3xl bg-surface p-4", className)}>
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-clip">
          {backHref && (
            <Link href={backHref} aria-label="Back" className="text-text-primary">
              <Icon icon={ChevronLeft} size={16} strokeWidth={1.5} />
            </Link>
          )}
          <h2 className="type-14sb text-text-primary whitespace-nowrap">{title}</h2>
          {subtitle && <p className="type-12m text-text-secondary whitespace-nowrap">{subtitle}</p>}
        </div>
        {scope && <p className="type-12m text-text-secondary whitespace-nowrap">{scope}</p>}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </section>
  );
}
