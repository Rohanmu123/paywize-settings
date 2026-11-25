import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Brand-coloured inline action ("Edit contact", "Transfer ownership"…). */
export const TextLink = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "brand" | "error" | "primary" }>(
  function TextLink({ className, tone = "brand", type = "button", ...rest }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex shrink-0 items-center gap-1 whitespace-nowrap type-12sb hover:underline underline-offset-2",
          tone === "brand" && "text-primary",
          tone === "error" && "text-on-error-container",
          tone === "primary" && "text-text-primary",
          className,
        )}
        {...rest}
      />
    );
  },
);
