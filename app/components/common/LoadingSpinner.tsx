"use client";

import React from "react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  variant?: "dots" | "bloom";
}

export function LoadingSpinner({
  message,
  size = "md",
  variant = "bloom",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "py-6",
    md: "py-10",
    lg: "py-16",
  };

  const textSizeClasses = {
    sm: "text-[11px]",
    md: "text-[13px]",
    lg: "text-[15px]",
  };

  if (variant === "dots") {
    return (
      <div
        className={`flex flex-col items-center gap-3 ${sizeClasses[size]} text-center`}
      >
        <div className="flex items-center gap-1.5 h-6">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-[var(--color-bloom-rose-400)]"
              style={{
                animation: `pulse 1.4s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
        {message && (
          <p
            className={`${textSizeClasses[size]} text-[var(--color-text-muted)] font-[family-name:var(--font-display)] italic`}
          >
            {message}
          </p>
        )}
      </div>
    );
  }

  // Bloom variant - animated petal circles
  return (
    <div
      className={`flex flex-col items-center gap-3 ${sizeClasses[size]} text-center`}
    >
      <div className="relative w-12 h-12 flex items-center justify-center">
        {/* Center bloom */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-2xl animate-bounce"
            style={{ animationDuration: "1.2s" }}
          >
            🌸
          </span>
        </div>
        {/* Orbiting petals */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute w-10 h-10"
            style={{
              animation: `spin ${2 + i * 0.3}s linear infinite`,
              animationDirection: i % 2 === 0 ? "normal" : "reverse",
            }}
          >
            <div
              className="absolute top-0 left-1/2 w-2 h-2 rounded-full bg-[var(--color-bloom-rose-300)]"
              style={{
                transform: "translateX(-50%)",
                opacity: 0.6,
              }}
            />
          </div>
        ))}
      </div>
      {message && (
        <p
          className={`${textSizeClasses[size]} text-[var(--color-text-muted)] font-[family-name:var(--font-display)] italic`}
        >
          {message}
        </p>
      )}
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
