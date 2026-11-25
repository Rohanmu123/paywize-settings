import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Figma radio "option card": 16 radius, 12/14 padding, primary tint when selected. */
export function OptionCard({ name, checked, onSelect, title, hint }: { name: string; checked: boolean; onSelect: () => void; title: ReactNode; hint?: ReactNode }) {
  return (
    <label className={cn("flex w-full cursor-pointer items-center gap-3 rounded-2xl border px-3.5 py-3", checked ? "border-primary bg-primary-container" : "border-border")}>
      <input type="radio" name={name} className="peer sr-only" checked={checked} onChange={onSelect} />
      <span aria-hidden className={cn("flex size-5 shrink-0 items-center justify-center rounded-full bg-surface peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40", checked ? "border-2 border-primary" : "border-[1.5px] border-border")}>
        {checked && <span className="size-2.5 rounded-full bg-primary" />}
      </span>
      <span className="flex min-w-px flex-1 flex-col gap-0.5">
        <span className="type-14m text-text-primary">{title}</span>
        {hint && <span className="type-12r text-text-secondary">{hint}</span>}
      </span>
    </label>
  );
}
