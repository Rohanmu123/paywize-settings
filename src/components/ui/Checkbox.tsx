"use client";

import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

/**
 * Figma "Checkbox": 20px box, 6 radius. Checked = brand fill + 14px white check;
 * unchecked = white with 1.5px border; disabled = container fill, border-variant.
 */
export function Checkbox({ checked, onChange, disabled, label, className, "aria-label": ariaLabel }: { checked: boolean; onChange?: (next: boolean) => void; disabled?: boolean; label?: ReactNode; className?: string; "aria-label"?: string }) {
  return (
    <label className={cn("inline-flex items-center gap-2.5", disabled ? "cursor-not-allowed" : "cursor-pointer", className)}>
      <input type="checkbox" className="peer sr-only" checked={checked} disabled={disabled} aria-label={ariaLabel} onChange={(e) => onChange?.(e.target.checked)} />
      <span
        aria-hidden
        className={cn(
          "flex size-5 shrink-0 items-center justify-center overflow-clip rounded-md peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40",
          disabled ? "border-[1.5px] border-border-variant bg-container" : checked ? "bg-primary text-on-primary" : "border-[1.5px] border-border bg-surface",
        )}
      >
        {checked && !disabled && <Icon icon={Check} size={14} strokeWidth={1.5} />}
      </span>
      {label && <span className="type-14r text-text-primary">{label}</span>}
    </label>
  );
}
