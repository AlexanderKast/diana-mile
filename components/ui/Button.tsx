import { ButtonHTMLAttributes, forwardRef } from "react";
import { cx } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cx(
          "inline-flex items-center justify-center gap-2 rounded-[2px] px-6 py-3.5 min-h-[44px] text-sm font-medium tracking-wide transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
          variant === "primary" &&
            "bg-carbon text-blanco hover:bg-carbon-suave",
          variant === "secondary" &&
            "border border-carbon text-carbon bg-transparent hover:bg-crema",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
