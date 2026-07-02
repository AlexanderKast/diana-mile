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
          "inline-flex items-center justify-center gap-2 rounded-[2px] px-6 py-3.5 min-h-[44px] text-sm font-medium tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
          variant === "primary" &&
            "btn-shine bg-dorado-oscuro text-blanco hover:bg-dorado hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(168,136,94,0.4)] active:scale-[0.97]",
          variant === "secondary" &&
            "border border-carbon text-carbon bg-transparent hover:bg-crema hover:scale-[1.015] active:scale-[0.98]",
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
