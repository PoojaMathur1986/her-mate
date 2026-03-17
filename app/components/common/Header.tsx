"use client";

import { useAuth } from "@/app/lib/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return "Good Morning";
  } else if (hour >= 12 && hour < 17) {
    return "Good Afternoon";
  } else {
    return "Good Evening";
  }
}

export function Header() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const greeting = getGreeting();

  // Don't show header on login page
  if (pathname === "/login") {
    return null;
  }

  if (loading) {
    return (
      <header className="w-full bg-[var(--color-bloom-rose-50)] border-b border-[var(--color-bloom-rose-100)] px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-body text-[var(--color-text-primary)]">
              Loading...
            </p>
          </div>
        </div>
      </header>
    );
  }

  const firstName = user?.displayName?.split(" ")[0] || "Friend";
  const photoURL = user?.photoURL;

  return (
    <header className="w-full bg-[var(--color-bloom-rose-50)] border-b border-[var(--color-bloom-rose-100)] px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Greeting */}
        <div>
          <p className="text-base font-body text-[var(--color-text-primary)]">
            {greeting},{" "}
            <span className="font-semibold font-body text-[var(--color-bloom-rose-500)]">
              {firstName}
            </span>
          </p>
        </div>

        {/* User Profile Image */}
        {photoURL ? (
          <Link href="/profile" className="flex-shrink-0">
            <img
              src={photoURL}
              alt={user?.displayName || "User profile"}
              className="w-10 h-10 rounded-full object-cover border-2 border-[var(--color-bloom-rose-200)] active:border-[var(--color-bloom-rose-400)] transition-colors"
              loading="lazy"
            />
          </Link>
        ) : (
          <Link href="/profile" className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-[var(--color-bloom-rose-200)] border-2 border-[var(--color-bloom-rose-200)] flex items-center justify-center text-sm font-semibold text-[var(--color-bloom-rose-600)]">
              {firstName.charAt(0).toUpperCase()}
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}
