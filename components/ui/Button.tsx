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
          "inline-flex items-center justify-center gap-2 rounded-[2px] px-6 py-3.5 min-h-[44px] text-base font-semibold tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
          variant === "primary" &&
            "btn-shine bg-dorado-oscuro text-blanco shadow-[0_4px_14px_rgba(168,136,94,0.35)] hover:bg-dorado hover:scale-[1.03] hover:shadow-[0_8px_24px_rgba(168,136,94,0.5)] active:scale-[0.97]",
          variant === "secondary" &&
            "border-2 border-carbon text-carbon bg-transparent hover:bg-crema hover:scale-[1.02] active:scale-[0.98]",
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
