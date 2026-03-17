import React from "react";

export interface RadioOption {
  value: string;
  label: string;
}

export interface RadioGroupProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
  options: RadioOption[];
  error?: string;
  helperText?: string;
  direction?: "row" | "column";
}

const RadioGroup = React.forwardRef<HTMLInputElement, RadioGroupProps>(
  (
    {
      label,
      options,
      error,
      helperText,
      direction = "column",
      name,
      id,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const radioName = name || id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <p className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            {label}
          </p>
        )}
        <div
          className={`
            flex gap-4
            ${direction === "row" ? "flex-row" : "flex-col"}
          `}
        >
          {options.map((option) => (
            <div key={option.value} className="flex items-center gap-2">
              <input
                ref={ref}
                type="radio"
                name={radioName}
                value={option.value}
                id={`${radioName}-${option.value}`}
                className={`
                  w-5 h-5 rounded-full border-2 border-[var(--color-border-soft)]
                  bg-[var(--color-bg-card)]
                  cursor-pointer
                  focus:outline-none focus:ring-2 focus:ring-[var(--color-bloom-rose-500)] focus:ring-offset-2
                  transition-all duration-150
                  accent-[var(--color-bloom-rose-500)]
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                {...props}
              />
              <label
                htmlFor={`${radioName}-${option.value}`}
                className="text-sm text-[var(--color-text-primary)] cursor-pointer"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
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

RadioGroup.displayName = "RadioGroup";

export { RadioGroup };
