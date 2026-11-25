import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ChipTone = "success" | "brand" | "warning" | "error" | "neutral" | "info";

const toneClass: Record<ChipTone, string> = {
  success: "bg-success-container border-on-success-container text-on-success-container",
  brand: "bg-primary-container border-on-primary-container text-on-primary-container",
  warning: "bg-warning-container border-on-warning-container text-on-warning-container",
  error: "bg-error-container border-on-error-container text-on-error-container",
  neutral: "bg-container border-transparent text-text-secondary",
  info: "bg-info-container border-on-info-container text-on-info-container",
};

/** Figma "Variant=Outline": transparent fill, 1px semantic border (Live / Test mode tags). */
const outlineClass: Partial<Record<ChipTone, string>> = {
  success: "border border-success text-on-success-container",
  info: "border border-info text-on-info-container",
  warning: "border border-on-warning-container text-on-warning-container",
  error: "border border-error text-on-error-container",
  brand: "border border-primary text-on-primary-container",
};

export function Chip({ tone = "success", variant = "soft", children, className, icon }: { tone?: ChipTone; variant?: "soft" | "outline"; children: ReactNode; className?: string; icon?: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center justify-center gap-1 overflow-clip rounded-xl border-solid px-2.5 whitespace-nowrap type-12sb",
        variant === "outline" ? (outlineClass[tone] ?? "border border-border text-text-secondary") : ["border-[0.5px]", toneClass[tone]],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
