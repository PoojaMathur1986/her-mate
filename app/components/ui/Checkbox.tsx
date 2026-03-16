import React from "react";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random()}`;

    return (
      <div className="flex items-start gap-2">
        <div className="flex items-center h-6">
          <input
            type="checkbox"
            ref={ref}
            id={checkboxId}
            className={`
              w-5 h-5 rounded border-2 border-[var(--color-border-soft)]
              bg-[var(--color-bg-card)]
              cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-[var(--color-bloom-rose-500)] focus:ring-offset-2
              transition-all duration-150
              accent-[var(--color-bloom-rose-500)]
              disabled:opacity-50 disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          />
        </div>
        {label && (
          <label
            htmlFor={checkboxId}
            className="text-sm text-[var(--color-text-primary)] cursor-pointer flex-1 pt-0.5"
          >
            {label}
          </label>
        )}
        {error && (
          <p className="text-xs text-[var(--color-bloom-rose-600)] mt-1">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
