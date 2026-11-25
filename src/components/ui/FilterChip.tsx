"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Segmented filter pill ("All  6"): brand fill when selected, container grey otherwise. */
export function FilterChip({ selected, onClick, children, className }: { selected: boolean; onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "inline-flex h-6 shrink-0 items-center justify-center overflow-clip rounded-xl px-2.5 whitespace-pre type-12sb",
        selected ? "bg-primary text-on-primary" : "bg-container text-text-secondary hover:bg-container-high",
        className,
      )}
    >
      {children}
    </button>
  );
}
