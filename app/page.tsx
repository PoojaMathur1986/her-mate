"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/app/lib/ProtectedRoute";
import { useAuth } from "@/app/lib/AuthContext";
import { BottomNav } from "@/app/components/common/BottomNav";
import {
  getMoodDisplay,
  formatMoodDate,
  type MoodDisplay
} from "@/app/lib/moodUtils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface QuickTile {
  href: string;
  icon: string;
  label: string;
  sublabel: string;
  tileClass: string;
  iconBg: string;
}

interface MemoryEntry {
  id: string;
  emoji: string;
  text: string;
  date: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const QUICK_TILES: QuickTile[] = [
  {
    href: "/journal",
    icon: "🎙️",
    label: "Journal",
    sublabel: "Talk or write it out",
    tileClass: "tile-journal",
    iconBg: "bg-[var(--color-bloom-petal-200)]"
  },
  {
    href: "/safe-space",
    icon: "💌",
    label: "Safe space",
    sublabel: "Vent, letters & wishes",
    tileClass: "tile-space",
    iconBg: "bg-[var(--color-bloom-rose-200)]"
  },
  {
    href: "/breathe",
    icon: "🌬️",
    label: "Breathe",
    sublabel: "Calm in 2 minutes",
    tileClass: "tile-breathe",
    iconBg: "bg-[var(--color-bloom-sage-200)]"
  },
  {
    href: "/memories",
    icon: "🌼",
    label: "Memories",
    sublabel: "My favourite moments",
    tileClass: "tile-memories",
    iconBg: "bg-[var(--color-bloom-honey-200)]"
  }
];

const RECENT_MEMORIES: MemoryEntry[] = [
  {
    id: "1",
    emoji: "☕",
    text: "That first sip of chai in the garden — pure peace.",
    date: "Yesterday"
  },
  {
    id: "2",
    emoji: "🌅",
    text: "The sky turned the most beautiful shade of pink this morning.",
    date: "2 days ago"
  }
];

// ─── Subcomponents ───────────────────────────────────────────────────────────

function QuickTileCard({ tile }: { tile: QuickTile }) {
  return (
    <Link
      href={tile.href}
      className={`
        ${tile.tileClass} p-4 flex flex-col gap-3
        active:scale-[0.97] transition-transform duration-150
        hover:brightness-[0.97]
      `}
    >
      <span
        className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${tile.iconBg}`}
      >
        {tile.icon}
      </span>
      <div>
        <p className="text-sm font-medium text-[var(--color-text-primary)] leading-tight">
          {tile.label}
        </p>
        <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 leading-snug">
          {tile.sublabel}
        </p>
      </div>
    </Link>
  );
}

function InsightStrip() {
  return (
    <Link
      href="/insights"
      className="
        mx-4 flex items-center gap-3 px-4 py-3.5 rounded-2xl
        bg-[var(--color-bloom-rose-100)] border border-[var(--color-border-soft)]
        active:scale-[0.98] transition-transform duration-150
      "
    >
      <span className="text-xl shrink-0">💡</span>
      <div className="flex-1 min-w-0">
        <p className="section-label mb-0.5">This week&apos;s pattern</p>
        <p className="font-[family-name:var(--font-display)] italic text-[13px] text-[var(--color-bloom-midnight-600)] leading-snug">
          &quot;You feel lighter on Fridays — what changes?&quot;
        </p>
      </div>
      <span className="text-[var(--color-text-brand)] text-lg shrink-0">→</span>
    </Link>
  );
}

function MemoryCard({ memory }: { memory: MemoryEntry }) {
  return (
    <div className="card px-4 py-3 flex items-start gap-3">
      <span className="text-xl shrink-0 mt-0.5">{memory.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-[var(--color-text-primary)] leading-snug font-[family-name:var(--font-display)] italic">
          {memory.text}
        </p>
        <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
          {memory.date}
        </p>
      </div>
    </div>
  );
}

function StreakBadge({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-1.5 bg-[var(--color-bloom-honey-100)] px-3 py-1.5 rounded-full border border-[var(--color-bloom-honey-200)]">
      <span className="text-sm">🔥</span>
      <span className="text-[12px] font-medium text-[var(--color-bloom-honey-700)]">
        {count} day streak
      </span>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

function HomePageContent() {
  const { user } = useAuth();
  const streakDays = 7;

  const [lastMood, setLastMood] = useState<
    (MoodDisplay & { createdAt: string }) | null
  >(null);
  const [isLoadingMood, setIsLoadingMood] = useState(true);

  // Fetch last captured mood on component mount
  useEffect(() => {
    const fetchLastMood = async () => {
      if (!user) {
        setIsLoadingMood(false);
        return;
      }

      try {
        const idToken = await user.getIdToken();
        const response = await fetch("/api/mood/last", {
          headers: {
            Authorization: `Bearer ${idToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const display = getMoodDisplay(data.data.mood);
            setLastMood({
              ...display,
              createdAt: data.data.createdAt
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch last mood:", error);
      } finally {
        setIsLoadingMood(false);
      }
    };

    fetchLastMood();
  }, [user]);

  return (
    <div className="min-h-dvh bg-[var(--color-bg-page)] font-[family-name:var(--font-body)]">
      {/* ── Scroll container ── */}
      <div className="max-w-sm mx-auto pb-28">
        {/* ── Mood card ── */}
        <section className="mx-4 mt-6" aria-label="Last mood">
          <Link
            href="/mood"
            className="card px-4 py-4 flex items-center justify-between active:scale-[0.98] transition-transform"
          >
            <div>
              <p className="text-[13px] text-[var(--color-text-secondary)] mb-2 font-[family-name:var(--font-display)] italic">
                How you&apos;re feeling
              </p>
              {isLoadingMood ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-[var(--color-border-soft)] rounded-full animate-pulse" />
                  <div className="space-y-1">
                    <div className="w-20 h-4 bg-[var(--color-border-soft)] rounded animate-pulse" />
                    <div className="w-24 h-3 bg-[var(--color-border-soft)] rounded animate-pulse" />
                  </div>
                </div>
              ) : lastMood ? (
                <>
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl noto-color-emoji">
                      {lastMood.emoji}
                    </span>
                    <div>
                      <p
                        className={`font-medium text-sm ${lastMood.textColor}`}
                      >
                        {lastMood.label}
                      </p>
                      <p className="text-[11px] text-[var(--color-text-muted)]">
                        {formatMoodDate(lastMood.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <StreakBadge count={streakDays} />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    No mood logged yet
                  </p>
                  <p className="text-[12px] text-[var(--color-text-brand)] font-medium">
                    Log your first mood →
                  </p>
                </div>
              )}
            </div>
            <span className="text-[var(--color-text-brand)] text-lg">→</span>
          </Link>
        </section>

        {/* ── Weekly insight strip ── */}
        <section className="mt-4" aria-label="Weekly insight">
          <InsightStrip />
        </section>

        {/* ── Quick-access tiles ── */}
        <section className="mt-6 px-4" aria-label="Quick access">
          <h2 className="section-label mb-3">Your space</h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_TILES.map((tile) => (
              <QuickTileCard key={tile.href} tile={tile} />
            ))}
          </div>
        </section>

        {/* ── Daily prompt ── */}
        <section className="mt-6 mx-4" aria-label="Daily prompt">
          <div
            className="rounded-2xl px-4 py-4 border border-[var(--color-border-soft)]"
            style={{
              background:
                "linear-gradient(135deg, var(--color-bloom-petal-50), var(--color-bloom-rose-50))"
            }}
          >
            <p className="section-label mb-2">Today&apos;s gentle prompt</p>
            <p className="font-[family-name:var(--font-display)] italic text-[var(--color-bloom-midnight-600)] text-[15px] leading-relaxed">
              &quot;What&apos;s one small thing that made you smile today, even
              briefly?&quot;
            </p>
            <Link
              href="/journal?prompt=smile"
              className="
                inline-flex items-center gap-1.5 mt-3 text-[12px] font-medium
                text-[var(--color-text-brand)] hover:underline underline-offset-2
              "
            >
              Write about it <span>→</span>
            </Link>
          </div>
        </section>

        {/* ── Recent memories ── */}
        <section className="mt-6 px-4" aria-label="Recent memories">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-label">Recent memories</h2>
            <Link
              href="/memories"
              className="text-[11px] text-[var(--color-text-brand)] font-medium hover:underline underline-offset-2"
            >
              See all
            </Link>
          </div>
          <div className="flex flex-col gap-2.5">
            {RECENT_MEMORIES.map((m) => (
              <MemoryCard key={m.id} memory={m} />
            ))}
          </div>
        </section>

        {/* ── Breathing nudge ── */}
        <section className="mt-5 mx-4 mb-2" aria-label="Breathe nudge">
          <Link
            href="/breathe"
            className="
              flex items-center gap-3 px-4 py-3.5 rounded-2xl
              bg-[var(--color-bloom-sage-50)] border border-[var(--color-bloom-sage-100)]
              active:scale-[0.98] transition-transform duration-150
            "
          >
            <span className="text-2xl">🌬️</span>
            <div className="flex-1">
              <p className="text-[13px] font-medium text-[var(--color-bloom-sage-700)]">
                Need a moment?
              </p>
              <p className="text-[11px] text-[var(--color-bloom-sage-600)] mt-0.5">
                2-minute breathing exercise
              </p>
            </div>
            <span className="text-[var(--color-bloom-sage-500)] text-lg">
              →
            </span>
          </Link>
        </section>
      </div>
      {/* end scroll container */}

      {/* ── Bottom navigation ── */}
      <BottomNav activeHref="/" />
    </div>
  );
}

export default function HomePage() {
  return (
    <ProtectedRoute>
      <HomePageContent />
    </ProtectedRoute>
  );
}
