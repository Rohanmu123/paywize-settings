"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Icon } from "./Icon";
import { cn } from "@/lib/cn";

/** Lucide copy icon that copies `value` and briefly turns into a check. */
export function CopyButton({ value, label, size = 14, className }: { value: string; label: string; size?: number; className?: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);
  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : `Copy ${label}`}
      title={copied ? "Copied" : "Copy"}
      className={cn("inline-flex shrink-0 cursor-pointer items-center justify-center text-text-secondary hover:text-text-primary", className)}
      onClick={async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(value);
        } catch {
          /* clipboard blocked: the check still confirms the intent */
        }
        setCopied(true);
      }}
    >
      <Icon icon={copied ? Check : Copy} size={size} className={copied ? "text-success" : undefined} />
    </button>
  );
}
