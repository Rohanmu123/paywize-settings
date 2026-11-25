import { cn } from "@/lib/cn";

export type AvatarTone = "primary" | "primary-container" | "on-primary-container" | "warning" | "neutral" | "info" | "success" | "error" | "container";
type Tone = AvatarTone;

const toneClass: Record<Tone, string> = {
  primary: "bg-primary text-on-primary",
  "primary-container": "bg-primary-container text-on-primary-container",
  "on-primary-container": "bg-on-primary-container text-surface",
  warning: "bg-warning-container text-on-warning-container border-[0.5px] border-on-warning-container",
  neutral: "bg-background text-text-secondary",
  info: "bg-info-container text-on-info-container",
  success: "bg-success-container text-on-success-container",
  error: "bg-error-container text-on-error-container",
  container: "bg-container text-text-secondary",
};

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function Avatar({ name, size = 40, tone = "primary", className }: { name: string; size?: 32 | 40 | 64; tone?: Tone; className?: string }) {
  return (
    <span
      aria-label={name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-clip rounded-full whitespace-nowrap",
        size === 64 ? "size-16 type-26m" : size === 40 ? "size-10 type-14m" : "size-8 type-12m",
        toneClass[tone],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
