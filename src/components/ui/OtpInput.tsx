"use client";

import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";

export const OTP_LENGTH = 6;

/** Six 52px cells ("InputOTP"). Digits only, auto-advance, paste and backspace support. */
export function OtpInput({ value, onChange, length = OTP_LENGTH, invalid, autoFocus = true }: { value: string; onChange: (v: string) => void; length?: number; invalid?: boolean; autoFocus?: boolean }) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const setAt = (i: number, ch: string) => {
    const chars = value.padEnd(length, " ").split("");
    chars[i] = ch || " ";
    onChange(chars.join("").replace(/\s+$/, ""));
  };

  const onKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[i] && i > 0) {
      refs.current[i - 1]?.focus();
      setAt(i - 1, "");
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    else if (e.key === "ArrowRight" && i < length - 1) refs.current[i + 1]?.focus();
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!digits) return;
    e.preventDefault();
    onChange(digits);
    refs.current[Math.min(digits.length, length - 1)]?.focus();
  };

  return (
    <div className="flex w-full items-start gap-2" role="group" aria-label="One-time password">
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          aria-label={`Digit ${i + 1}`}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={value[i]?.trim() ?? ""}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, "").slice(-1);
            setAt(i, d);
            if (d && i < length - 1) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={onPaste}
          className={cn(
            "h-[52px] min-w-px flex-1 rounded-xl border bg-surface text-center type-20sb text-text-primary outline-none focus:border-primary",
            invalid ? "border-error" : "border-border",
          )}
        />
      ))}
    </div>
  );
}
