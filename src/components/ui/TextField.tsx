"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Common = {
  label?: ReactNode;
  helper?: ReactNode;
  error?: string | null;
  leading?: ReactNode;
  trailing?: ReactNode;
  containerClassName?: string;
};

export const fieldBoxClass =
  "flex w-full items-center gap-2 overflow-clip rounded-xl px-3 type-14r text-text-primary focus-within:border-primary";

/** Figma "Input": 12 semibold label, 40px field (12 radius), optional helper line. */
export const TextField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & Common>(function TextField(
  { label, helper, error, leading, trailing, containerClassName, className, id, disabled, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const helpId = `${inputId}-help`;
  return (
    <div className={cn("flex min-w-px flex-1 flex-col items-start gap-1.5", containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="type-12sb text-text-primary whitespace-nowrap">
          {label}
        </label>
      )}
      <div className={cn(fieldBoxClass, "h-10", error ? "border-[0.5px] border-error bg-error-container" : disabled ? "border border-border bg-container" : "border border-border bg-surface")}>
        {leading}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={!!error || undefined}
          aria-describedby={helper || error ? helpId : undefined}
          className={cn("h-full min-w-px flex-1 bg-transparent outline-none placeholder:text-text-tertiary disabled:text-text-primary", className)}
          {...rest}
        />
        {trailing}
      </div>
      {(error || helper) && (
        <p id={helpId} className={cn("type-12r", error ? "text-error" : "text-text-secondary")}>
          {error || helper}
        </p>
      )}
    </div>
  );
});

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & Common & { height?: number }>(function TextArea(
  { label, helper, error, containerClassName, className, id, height = 80, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className={cn("flex min-w-px flex-1 flex-col items-start gap-1.5", containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="type-12sb text-text-primary whitespace-nowrap">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        style={{ height }}
        aria-invalid={!!error || undefined}
        className={cn(
          "w-full resize-none rounded-xl px-3 py-3 type-14r text-text-primary outline-none placeholder:text-text-tertiary focus:border-primary",
          error ? "border-[0.5px] border-error bg-error-container" : "border border-border bg-surface",
          className,
        )}
        {...rest}
      />
      {(error || helper) && <p className={cn("type-12r", error ? "text-error" : "text-text-secondary")}>{error || helper}</p>}
    </div>
  );
});
