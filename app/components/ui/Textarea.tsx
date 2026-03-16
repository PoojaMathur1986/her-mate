import React from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  maxLength?: number;
  showCharCount?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      maxLength,
      showCharCount,
      id,
      ...props
    },
    ref,
  ) => {
    const [charCount, setCharCount] = React.useState(0);
    const textareaId = id || `textarea-${Math.random()}`;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      props.onChange?.(e);
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-[var(--color-text-primary)] mb-2"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          maxLength={maxLength}
          className={`
            w-full px-3 py-2 rounded-lg
            bg-[var(--color-bg-card)] border border-[var(--color-border-soft)]
            text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]
            focus:outline-none focus:ring-2 focus:ring-[var(--color-bloom-rose-500)] focus:border-transparent
            transition-all duration-150
            disabled:opacity-50 disabled:cursor-not-allowed
            resize-none
            ${error ? "border-[var(--color-bloom-rose-500)] focus:ring-[var(--color-bloom-rose-500)]" : ""}
            ${className}
          `}
          onChange={handleChange}
          {...props}
        />
        <div className="flex items-center justify-between mt-1.5">
          <div>
            {error && (
              <p className="text-xs text-[var(--color-bloom-rose-600)]">
                {error}
              </p>
            )}
            {helperText && !error && (
              <p className="text-xs text-[var(--color-text-muted)]">
                {helperText}
              </p>
            )}
          </div>
          {showCharCount && maxLength && (
            <p className="text-xs text-[var(--color-text-muted)]">
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export { Textarea };
