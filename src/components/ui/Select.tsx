"use client";

import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

export type Option = { value: string; label: string };

/** Native select dressed as the Figma "Dropdown" input (40px, chevron-down). */
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { label?: ReactNode; helper?: ReactNode; options: Option[]; containerClassName?: string }>(
  function Select({ label, helper, options, containerClassName, className, id, ...rest }, ref) {
    const autoId = useId();
    const selectId = id ?? autoId;
    return (
      <div className={cn("flex min-w-px flex-1 flex-col items-start gap-1.5", containerClassName)}>
        {label && (
          <label htmlFor={selectId} className="type-12sb text-text-primary whitespace-nowrap">
            {label}
          </label>
        )}
        <div className="relative w-full">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "h-10 w-full appearance-none rounded-xl border border-border bg-surface pr-11 pl-3 type-14r text-text-primary outline-none focus:border-primary",
              className,
            )}
            {...rest}
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <Icon icon={ChevronDown} size={24} strokeWidth={1.5} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-text-secondary" />
        </div>
        {helper && <p className="type-12r text-text-secondary">{helper}</p>}
      </div>
    );
  },
);
