import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";
import { cx } from "../utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string };

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-xs text-ceniza font-medium">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={cx(
            "min-h-[44px] rounded-lg border border-arena bg-blanco px-4 py-2.5 text-base text-carbon placeholder:text-ceniza focus:outline-none focus:border-dorado transition-colors",
            error && "border-error",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-error">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string };

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, className, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-xs text-ceniza font-medium">
          {label}
        </label>
        <textarea
          ref={ref}
          id={inputId}
          className={cx(
            "rounded-lg border border-arena bg-blanco px-4 py-2.5 text-base text-carbon placeholder:text-ceniza focus:outline-none focus:border-dorado transition-colors resize-none",
            error && "border-error",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-error">{error}</span>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
