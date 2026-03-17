import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--color-text-primary)] mb-2"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          id={inputId}
          className={`
            w-full px-3 py-2 rounded-lg
            bg-[var(--color-bg-card)] border border-[var(--color-border-soft)]
            text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]
            focus:outline-none focus:ring-2 focus:ring-[var(--color-bloom-rose-500)] focus:border-transparent
            transition-all duration-150
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? "border-[var(--color-bloom-rose-500)] focus:ring-[var(--color-bloom-rose-500)]" : ""}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-xs text-[var(--color-bloom-rose-600)] mt-1.5">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-xs text-[var(--color-text-muted)] mt-1.5">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
