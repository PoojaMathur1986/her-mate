"use client";

import { useState } from "react";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────

type MoodKey = "heavy" | "meh" | "okay" | "good" | "bright";

interface Mood {
  key: MoodKey;
  emoji: string;
  label: string;
  color: string; // ring / selected bg
  textColor: string;
}

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

const MOODS: Mood[] = [
  {
    key: "heavy",
    emoji: "🌧️",
    label: "Heavy",
    color:
      "bg-[var(--color-bloom-midnight-100)] ring-[var(--color-bloom-midnight-300)]",
    textColor: "text-[var(--color-bloom-midnight-600)]"
  },
  {
    key: "meh",
    emoji: "😶",
    label: "Meh",
    color:
      "bg-[var(--color-bloom-blush-100)]    ring-[var(--color-bloom-blush-400)]",
    textColor: "text-[var(--color-bloom-blush-700)]"
  },
  {
    key: "okay",
    emoji: "🌿",
    label: "Okay",
    color:
      "bg-[var(--color-bloom-sage-100)]     ring-[var(--color-bloom-sage-400)]",
    textColor: "text-[var(--color-bloom-sage-700)]"
  },
  {
    key: "good",
    emoji: "🌸",
    label: "Good",
    color:
      "bg-[var(--color-bloom-rose-100)]     ring-[var(--color-bloom-rose-400)]",
    textColor: "text-[var(--color-bloom-rose-700)]"
  },
  {
    key: "bright",
    emoji: "✨",
    label: "Bright",
    color:
      "bg-[var(--color-bloom-honey-100)]    ring-[var(--color-bloom-honey-400)]",
    textColor: "text-[var(--color-bloom-honey-700)]"
  }
];

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

const NAV_ITEMS = [
  { href: "/", icon: "🏠", label: "Home" },
  { href: "/journal", icon: "📖", label: "Journal" },
  { href: "/mood", icon: "💜", label: "Mood" },
  { href: "/insights", icon: "📊", label: "Insights" },
  { href: "/profile", icon: "🌸", label: "You" }
];

// ─── Subcomponents ───────────────────────────────────────────────────────────

function MoodButton({
  mood,
  selected,
  onSelect
}: {
  mood: Mood;
  selected: boolean;
  onSelect: (key: MoodKey) => void;
}) {
  return (
    <button
      onClick={() => onSelect(mood.key)}
      aria-label={`Mood: ${mood.label}`}
      className={`
        flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-2xl
        transition-all duration-200 active:scale-95 cursor-pointer
        ${
          selected
            ? `ring-2 ${mood.color} shadow-sm`
            : "hover:bg-[var(--color-bloom-rose-50)]"
        }
      `}
    >
      <span className="text-2xl leading-none">{mood.emoji}</span>
      <span
        className={`text-[10px] font-medium tracking-wide ${selected ? mood.textColor : "text-[var(--color-text-muted)]"}`}
      >
        {mood.label}
      </span>
    </button>
  );
}

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

function BottomNav({ activeHref }: { activeHref: string }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-bg-page)]/95 backdrop-blur-md border-t border-[var(--color-border-soft)]">
      <div className="max-w-sm mx-auto flex justify-around items-center px-2 py-2 pb-[env(safe-area-inset-bottom)]">
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
              <span className="text-[18px] leading-none">{item.icon}</span>
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

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [selectedMood, setSelectedMood] = useState<MoodKey | null>("okay");
  const [moodLogged, setMoodLogged] = useState(false);

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 17
        ? "Good afternoon"
        : "Good evening";

  // Replace with real user name from session/db
  const userName = "Priya";
  const streakDays = 7;

  function handleMoodLog() {
    if (!selectedMood) return;
    setMoodLogged(true);
    // TODO: POST /api/mood { mood: selectedMood, date: new Date() }
  }

  return (
    <div className="min-h-dvh bg-[var(--color-bg-page)] font-[family-name:var(--font-body)]">
      {/* ── Scroll container ── */}
      <div className="max-w-sm mx-auto pb-28">
        {/* ── Header ── */}
        <header
          className="px-5 pt-12 pb-6 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(160deg, var(--color-bloom-blush-100) 0%, var(--color-bloom-rose-50) 100%)"
          }}
        >
          {/* Decorative blobs */}
          <div
            aria-hidden
            className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-20 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, var(--color-bloom-rose-300), transparent 70%)"
            }}
          />
          <div
            aria-hidden
            className="absolute bottom-0 left-4 w-24 h-24 rounded-full opacity-10 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, var(--color-bloom-petal-300), transparent 70%)"
            }}
          />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="section-label mb-1">{greeting}</p>
              <h1 className="font-[family-name:var(--font-display)] text-2xl font-normal text-[var(--color-bloom-midnight-600)] leading-tight">
                How are you{" "}
                <em className="italic text-[var(--color-bloom-rose-500)]">
                  really
                </em>{" "}
                feeling today?
              </h1>
            </div>
            <Link
              href="/profile"
              className="w-10 h-10 rounded-full bg-[var(--color-bloom-rose-200)] flex items-center justify-center text-sm font-medium text-[var(--color-bloom-rose-800)] shrink-0 ml-3 mt-1 border border-[var(--color-border-soft)]"
              aria-label="Profile"
            >
              {userName.charAt(0)}
            </Link>
          </div>

          <div className="mt-3">
            <StreakBadge count={streakDays} />
          </div>
        </header>

        {/* ── Mood check-in card ── */}
        <section className="mx-4 mt-4" aria-label="Mood check-in">
          <div className="card px-4 py-4">
            {moodLogged ? (
              <div className="flex flex-col items-center gap-2 py-2 text-center">
                <span className="text-3xl">
                  {MOODS.find((m) => m.key === selectedMood)?.emoji}
                </span>
                <p className="font-[family-name:var(--font-display)] italic text-[var(--color-text-secondary)] text-sm">
                  Mood logged — thank you for checking in 🌸
                </p>
                <button
                  onClick={() => {
                    setMoodLogged(false);
                  }}
                  className="text-[11px] text-[var(--color-text-muted)] underline underline-offset-2 mt-1"
                >
                  Change
                </button>
              </div>
            ) : (
              <>
                <p className="text-[13px] text-[var(--color-text-secondary)] mb-3 font-[family-name:var(--font-display)] italic">
                  Pick the one that feels closest right now
                </p>
                <div className="flex justify-between">
                  {MOODS.map((mood) => (
                    <MoodButton
                      key={mood.key}
                      mood={mood}
                      selected={selectedMood === mood.key}
                      onSelect={setSelectedMood}
                    />
                  ))}
                </div>
                <button
                  onClick={handleMoodLog}
                  disabled={!selectedMood}
                  className="
                    btn-primary w-full mt-4 text-sm
                    disabled:opacity-40 disabled:cursor-not-allowed
                  "
                >
                  Log mood
                </button>
              </>
            )}
          </div>
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
