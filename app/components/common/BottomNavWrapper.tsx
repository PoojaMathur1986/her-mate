"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "./BottomNav";

export function BottomNavWrapper() {
  const pathname = usePathname();

  // Don't show BottomNav on login page
  if (pathname === "/login") {
    return null;
  }

  // Map pathname to activeHref (handle dynamic routes)
  const getActiveHref = () => {
    if (pathname === "/") return "/";
    if (pathname.startsWith("/journal")) return "/journal";
    if (pathname.startsWith("/mood")) return "/mood";
    if (pathname.startsWith("/profile")) return "/profile";
    // Default fallback
    return pathname;
  };

  return <BottomNav activeHref={getActiveHref()} />;
}
