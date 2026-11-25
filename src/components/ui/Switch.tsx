"use client";

import { cn } from "@/lib/cn";

/** Figma "Switch": 44×24 pill track (brand when on, #e5e5e5 off) with a 20px white knob. */
export function Switch({ checked, onChange, disabled, locked, className, "aria-label": ariaLabel }: { checked: boolean; onChange?: (next: boolean) => void; disabled?: boolean; /** Read-only but shown at full strength ("Always on"). */ locked?: boolean; className?: string; "aria-label"?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled || locked}
      onClick={() => onChange?.(!checked)}
      className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors duration-150", locked ? "cursor-not-allowed" : "disabled:opacity-50", checked ? "bg-primary" : "bg-container-high", className)}
    >
      <span className={cn("absolute top-0.5 size-5 rounded-full bg-surface transition-[left] duration-150", checked ? "left-[22px]" : "left-0.5")} />
    </button>
  );
}
