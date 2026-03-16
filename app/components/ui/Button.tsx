import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      fullWidth,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "font-medium rounded-lg transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variantStyles = {
      primary:
        "bg-[var(--color-bloom-rose-500)] text-[var(--color-text-inverse)] hover:bg-[var(--color-bloom-rose-600)] active:scale-95",
      secondary:
        "bg-[var(--color-bloom-rose-50)] text-[var(--color-text-brand)] border border-[var(--color-bloom-rose-200)] hover:bg-[var(--color-bloom-rose-100)] active:scale-95",
      tertiary:
        "bg-transparent text-[var(--color-text-brand)] hover:bg-[var(--color-bloom-rose-50)] active:scale-95",
      danger:
        "bg-[var(--color-bloom-rose-600)] text-[var(--color-text-inverse)] hover:bg-[var(--color-bloom-rose-700)] active:scale-95",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        {...props}
      >
        {loading && (
          <span className="animate-spin">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 2a10 10 0 100 20 10 10 0 000-20z"
              />
            </svg>
          </span>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };
