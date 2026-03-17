"use client";

import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { useAuth } from "@/app/lib/AuthContext";
import { ProtectedRoute } from "@/app/lib/ProtectedRoute";
import { BottomNav } from "@/app/components/common/BottomNav";

// ─── Types ───────────────────────────────────────────────────────────────────

interface StatItem {
  label: string;
  value: string | number;
  emoji: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

// Placeholder stats — wire to real data when ready
const STATS: StatItem[] = [
  { label: "Day streak", value: 7, emoji: "🔥" },
  { label: "Journal notes", value: 24, emoji: "📖" },
  { label: "Moods logged", value: 18, emoji: "💜" },
  { label: "Memories", value: 6, emoji: "🌼" },
];

// ─── Subcomponents ───────────────────────────────────────────────────────────

function StatCard({ stat }: { stat: StatItem }) {
  return (
    <div className="card flex flex-col items-center gap-1.5 px-3 py-4">
      <span className="text-2xl">{stat.emoji}</span>
      <span className="font-[family-name:var(--font-display)] text-xl text-[var(--color-bloom-midnight-600)]">
        {stat.value}
      </span>
      <span className="text-[10px] text-[var(--color-text-muted)] font-medium tracking-wide text-center leading-tight">
        {stat.label}
      </span>
    </div>
  );
}

function AvatarInitials({ name }: { name: string }) {
  // Get up to 2 initials
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  return (
    <div
      className="relative w-24 h-24 rounded-[2rem] flex items-center justify-center text-3xl font-[family-name:var(--font-display)] font-normal text-[var(--color-bloom-rose-800)] shrink-0 select-none"
      style={{
        background:
          "linear-gradient(145deg, var(--color-bloom-rose-200), var(--color-bloom-petal-200))",
        boxShadow: "0 4px 24px rgba(180, 100, 130, 0.18)",
      }}
    >
      {initials}
      {/* Decorative ring */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-[2rem] pointer-events-none"
        style={{ border: "1.5px solid rgba(212, 83, 126, 0.18)" }}
      />
    </div>
  );
}

function LogoutConfirmDialog({
  onConfirm,
  onCancel,
  loading,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center"
      style={{ background: "var(--color-bg-overlay)" }}
    >
      {/* Backdrop tap to dismiss */}
      <button
        aria-label="Dismiss"
        className="absolute inset-0 w-full h-full cursor-default"
        onClick={onCancel}
      />

      {/* Sheet */}
      <div
        className="relative w-full max-w-sm mx-auto rounded-t-[2rem] px-6 pt-6 pb-10 flex flex-col gap-5"
        style={{
          background: "var(--color-bg-card)",
          boxShadow: "0 -8px 40px rgba(180, 100, 130, 0.14)",
        }}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 rounded-full bg-[var(--color-border-medium)] mx-auto mb-1" />

        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-4xl">👋</span>
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-bloom-midnight-600)]">
            Leaving so soon?
          </h2>
          <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
            Your entries and memories will be right here whenever you come back
            🌸
          </p>
        </div>

        <div className="flex flex-col gap-2.5 mt-1">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="
              btn-primary text-sm w-full disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
            "
            style={{ background: "var(--color-bloom-midnight-600)" }}
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Signing out…
              </>
            ) : (
              "Yes, sign me out"
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="btn-ghost text-sm w-full"
          >
            Stay a little longer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

function ProfilePageContent() {
  const { user, loading: authLoading } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  // Trigger entrance animation after mount
  useEffect(() => {
    const t = setTimeout(() => setFadeIn(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Derive display name: prefer displayName, fall back to email prefix
  const displayName =
    user?.displayName ?? (user?.email ? user.email.split("@")[0] : "You");

  // Member since — format from Firebase user metadata
  const memberSince = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString([], {
        month: "long",
        year: "numeric",
      })
    : null;

  async function handleLogout() {
    setSigningOut(true);
    try {
      await signOut(auth);
      // Firebase auth state change will redirect via your auth guard
    } catch (err) {
      console.error("Sign-out error:", err);
      setSigningOut(false);
      setShowLogoutDialog(false);
    }
  }

  return (
    <>
      <div
        className="min-h-dvh bg-[var(--color-bg-page)] font-[family-name:var(--font-body)]"
        style={{
          opacity: fadeIn ? 1 : 0,
          transform: fadeIn ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}
      >
        <div className="max-w-sm mx-auto pb-32">
          {/* ── Header ── */}
          <header
            className="px-5 pt-12 pb-8 relative overflow-hidden"
            style={{
              background:
                "linear-gradient(160deg, var(--color-bloom-blush-100) 0%, var(--color-bloom-rose-50) 60%, var(--color-bloom-petal-50) 100%)",
            }}
          >
            {/* Decorative blobs */}
            <div
              aria-hidden
              className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, var(--color-bloom-rose-300), transparent 70%)",
              }}
            />
            <div
              aria-hidden
              className="absolute bottom-0 -left-6 w-28 h-28 rounded-full opacity-10 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, var(--color-bloom-petal-300), transparent 70%)",
              }}
            />

            <div className="relative flex flex-col items-center gap-4 text-center">
              {/* Avatar */}
              {authLoading ? (
                <div
                  className="w-24 h-24 rounded-[2rem]"
                  style={{
                    background: "var(--color-bloom-rose-100)",
                    animation: "pulse 1.8s ease-in-out infinite",
                  }}
                />
              ) : (
                <AvatarInitials name={displayName} />
              )}

              {/* Name */}
              {authLoading ? (
                <div
                  className="h-7 w-32 rounded-full"
                  style={{ background: "var(--color-bloom-rose-100)" }}
                />
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <h1 className="font-[family-name:var(--font-display)] text-2xl font-normal text-[var(--color-bloom-midnight-600)] leading-tight">
                    {displayName}
                  </h1>
                  {memberSince && (
                    <p className="text-[11px] text-[var(--color-text-muted)]">
                      Blooming since {memberSince}
                    </p>
                  )}
                </div>
              )}

              {/* Email chip */}
              {user?.email && (
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--color-border-soft)]"
                  style={{ background: "rgba(255,255,255,0.6)" }}
                >
                  <span className="text-[11px]">✉️</span>
                  <span className="text-[11px] text-[var(--color-text-secondary)]">
                    {user.email}
                  </span>
                </div>
              )}
            </div>
          </header>

          {/* ── Stats grid ── */}
          <section className="mt-6 px-4" aria-label="Your stats">
            <p className="section-label mb-3">Your journey</p>
            <div className="grid grid-cols-4 gap-2.5">
              {STATS.map((stat) => (
                <StatCard key={stat.label} stat={stat} />
              ))}
            </div>
          </section>

          {/* ── Account section ── */}
          <section className="mt-6 px-4" aria-label="Account">
            <p className="section-label mb-3">Account</p>
            <div className="card divide-y divide-[var(--color-border-soft)]">
              {/* Signed-in-as row */}
              <div className="flex items-center gap-3 px-4 py-3.5">
                <span className="text-lg shrink-0">🌸</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-[var(--color-text-muted)] leading-tight">
                    Signed in as
                  </p>
                  <p className="text-[13px] text-[var(--color-text-primary)] font-medium truncate">
                    {authLoading ? "—" : (user?.email ?? displayName)}
                  </p>
                </div>
              </div>

              {/* More account rows (placeholders for future) */}
              <div className="flex items-center gap-3 px-4 py-3.5 opacity-40 pointer-events-none select-none">
                <span className="text-lg shrink-0">🔔</span>
                <div className="flex-1">
                  <p className="text-[13px] text-[var(--color-text-primary)]">
                    Reminders
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    Coming soon
                  </p>
                </div>
                <span className="text-[var(--color-text-muted)] text-sm">
                  →
                </span>
              </div>

              <div className="flex items-center gap-3 px-4 py-3.5 opacity-40 pointer-events-none select-none">
                <span className="text-lg shrink-0">🎨</span>
                <div className="flex-1">
                  <p className="text-[13px] text-[var(--color-text-primary)]">
                    Themes
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    Coming soon
                  </p>
                </div>
                <span className="text-[var(--color-text-muted)] text-sm">
                  →
                </span>
              </div>
            </div>
          </section>

          {/* ── Sign out ── */}
          <section className="mt-5 px-4">
            <button
              onClick={() => setShowLogoutDialog(true)}
              className="
                w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl
                border border-[var(--color-border-medium)] bg-transparent
                text-[13px] font-medium text-[var(--color-bloom-midnight-400)]
                hover:bg-[var(--color-bloom-rose-50)] hover:border-[var(--color-bloom-rose-200)]
                hover:text-[var(--color-bloom-midnight-600)]
                active:scale-[0.98] transition-all duration-150 cursor-pointer
              "
            >
              <span className="text-base">👋</span>
              Sign out
            </button>
          </section>

          {/* ── Bloom wordmark ── */}
          <p className="mt-10 text-center font-[family-name:var(--font-display)] italic text-[var(--color-bloom-rose-300)] text-sm opacity-60 select-none">
            bloom
          </p>
        </div>

        <BottomNav activeHref="/profile" />
      </div>

      {/* ── Logout confirmation bottom sheet ── */}
      {showLogoutDialog && (
        <LogoutConfirmDialog
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutDialog(false)}
          loading={signingOut}
        />
      )}
    </>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}
