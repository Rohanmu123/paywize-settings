import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "dark" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

/** Mirrors the Figma "Button" component set (Variant × Size × State). */
const variantClass: Record<ButtonVariant, string> = {
  primary: "bg-primary text-on-primary",
  dark: "bg-dark text-on-primary hover:bg-dark-hover active:bg-dark-pressed",
  secondary:
    "bg-primary-container text-on-primary-container border-[0.5px] border-transparent hover:border-primary active:border-primary",
  outline:
    "bg-surface text-text-primary border border-border hover:bg-container active:bg-container-high active:border-border-variant",
  ghost: "bg-transparent text-text-primary hover:bg-container active:bg-container-high",
  danger:
    "bg-error text-on-primary border-[0.5px] border-transparent hover:bg-error-container hover:text-on-error-container hover:border-error active:bg-error-container active:text-on-error-container active:border-error",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-8 rounded-2xl type-12sb",
  md: "h-10 rounded-[20px] type-14sb",
  lg: "h-12 rounded-3xl type-16sb",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Stretches to fill a flex row (modal footers). */
  block?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", block, className, type = "button", children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 overflow-clip px-6 whitespace-nowrap transition-colors",
        "disabled:cursor-not-allowed disabled:border-transparent disabled:bg-container disabled:text-text-disabled",
        variant === "outline" && "disabled:bg-surface disabled:border-border-variant",
        variant === "ghost" && "disabled:bg-transparent",
        variantClass[variant],
        sizeClass[size],
        block && "min-w-px flex-1",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
});
