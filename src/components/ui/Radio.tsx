"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Figma "Radio": 20px ring (2px brand + 10px dot when selected, 1.5px border otherwise) + 14 regular label. */
export function Radio({ name, value, checked, onChange, label, className }: { name: string; value: string; checked: boolean; onChange: (value: string) => void; label: ReactNode; className?: string }) {
  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-2.5", className)}>
      <input type="radio" className="peer sr-only" name={name} value={value} checked={checked} onChange={() => onChange(value)} />
      <span
        aria-hidden
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full bg-surface peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40",
          checked ? "border-2 border-primary" : "border-[1.5px] border-border",
        )}
      >
        {checked && <span className="size-2.5 rounded-full bg-primary" />}
      </span>
      <span className="type-14r text-text-primary whitespace-nowrap">{label}</span>
    </label>
  );
}
