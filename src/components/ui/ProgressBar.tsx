import { cn } from "@/lib/cn";

/** 8px track (Surface/Background) with a brand fill, 4px radius. */
export function ProgressBar({ value, max, label, className, tone = "primary" }: { value: number; max: number; label?: string; className?: string; tone?: "primary" | "warning" | "error" }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
      className={cn("flex h-2 w-full items-start overflow-clip rounded-[4px] bg-background", className)}
    >
      <div className={cn("h-2 rounded-[4px]", tone === "primary" ? "bg-primary" : tone === "warning" ? "bg-on-warning-container" : "bg-error")} style={{ width: `${pct}%` }} />
    </div>
  );
}
