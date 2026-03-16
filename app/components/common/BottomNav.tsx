"use client";

import Link from "next/link";
import {
  HiOutlineHome,
  HiOutlineBookOpen,
  HiOutlineChartBar,
  HiOutlineUser,
  HiOutlineHeart,
} from "react-icons/hi2";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: <HiOutlineHome /> },
  { href: "/journal", label: "Journal", icon: <HiOutlineBookOpen /> },
  { href: "/mood", label: "Mood", icon: <HiOutlineHeart /> },
  { href: "/insights", label: "Insights", icon: <HiOutlineChartBar /> },
  { href: "/profile", label: "You", icon: <HiOutlineUser /> },
];

export function BottomNav({ activeHref }: { activeHref: string }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-bg-page)]/95 backdrop-blur-md border-t border-[var(--color-border-soft)] max-w-sm mx-auto">
      <div className="flex justify-around items-center px-2 py-2 pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === activeHref;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl
                transition-all duration-150 min-w-[52px]
                ${isActive ? "bg-[var(--color-bloom-rose-100)]" : "hover:bg-[var(--color-bloom-rose-50)]"}
              `}
            >
              <span
                className={`text-xl leading-none transition-colors ${
                  isActive
                    ? "text-[var(--color-text-brand)]"
                    : "text-[var(--color-text-secondary)]"
                }`}
              >
                {item.icon}
              </span>
              <span
                className={`text-[10px] font-medium tracking-wide ${isActive ? "text-[var(--color-text-brand)]" : "text-[var(--color-text-muted)]"}`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[var(--color-bloom-rose-400)] mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
