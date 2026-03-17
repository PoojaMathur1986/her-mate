"use client";

import { useState, useRef, useEffect } from "react";
import { BottomNav } from "@/app/components/common/BottomNav";
import {
  fetchJournalEntries,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry
} from "@/app/lib/journalClient";

// ─── Types ───────────────────────────────────────────────────────────────────

interface JournalEntry {
  id: string;
  text: string;
  emoji: string;
  timestamp: Date;
  dateKey: string; // "YYYY-MM-DD"
}

// ─── Constants ───────────────────────────────────────────────────────────────

const EMOJI_STICKERS = [
  "✨",
  "🌸",
  "💭",
  "🌿",
  "🌤",
  "🌙",
  "🌞",
  "💫",
  "🍃",
  "🌊",
  "🔥",
  "🌈",
  "🦋",
  "🌺",
  "💎",
  "🍀",
  "🌷",
  "🌟",
  "💕",
  "🌼"
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDayLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

function isToday(dateKey: string): boolean {
  return dateKey === toDateKey(new Date());
}

// Generate the last 28 days for the calendar strip
function getLast28Days(): {
  dateKey: string;
  dayNum: number;
  dayName: string;
  monthName: string;
}[] {
  const days = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      dateKey: toDateKey(d),
      dayNum: d.getDate(),
      dayName: d.toLocaleDateString([], { weekday: "short" }),
      monthName: d.toLocaleDateString([], { month: "short" })
    });
  }
  return days;
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function EmojiPicker({
  selected,
  onSelect,
  onClose
}: {
  selected: string;
  onSelect: (e: string) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 mb-2 z-50 p-2 rounded-2xl shadow-lg border border-[var(--color-border-soft)]"
      style={{ background: "var(--color-bg-card)", minWidth: "220px" }}
    >
      <div className="grid grid-cols-5 gap-1">
        {EMOJI_STICKERS.map((e) => (
          <button
            key={e}
            onClick={() => {
              onSelect(e);
              onClose();
            }}
            className={`
              w-9 h-9 rounded-xl flex items-center justify-center text-lg
              transition-all duration-100 active:scale-90 cursor-pointer
              ${selected === e ? "bg-[var(--color-bloom-rose-100)] ring-1 ring-[var(--color-bloom-rose-300)]" : "hover:bg-[var(--color-bloom-rose-50)]"}
            `}
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}

function EntryCard({
  entry,
  sealed,
  onEdit,
  onDelete
}: {
  entry: JournalEntry;
  sealed: boolean;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(entry.text);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = textareaRef.current.value.length;
    }
  }, [editing]);

  function saveEdit() {
    if (draft.trim()) {
      onEdit(entry.id, draft.trim());
    }
    setEditing(false);
  }

  return (
    <div
      className={`card px-4 py-3.5 transition-all duration-200 ${sealed ? "opacity-85" : ""}`}
    >
      <div className="flex items-start gap-3">
        {/* Emoji sticker */}
        <span className="text-xl shrink-0 mt-0.5">{entry.emoji}</span>

        <div className="flex-1 min-w-0">
          {editing ? (
            <>
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={4}
                className="
                  w-full text-[13px] text-[var(--color-text-primary)] leading-relaxed
                  font-[family-name:var(--font-display)] italic
                  resize-none bg-transparent outline-none
                  border-b border-[var(--color-bloom-rose-200)] pb-1
                "
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={saveEdit}
                  className="btn-primary text-[11px] px-3 py-1.5"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setDraft(entry.text);
                  }}
                  className="btn-ghost text-[11px] px-3 py-1.5"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <p className="text-[13px] text-[var(--color-text-primary)] leading-relaxed font-[family-name:var(--font-display)] italic">
              {entry.text}
            </p>
          )}

          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] text-[var(--color-text-muted)]">
              {formatTime(entry.timestamp)}
              {sealed && (
                <span className="ml-1.5 text-[10px] text-[var(--color-bloom-petal-500)]">
                  🔒 sealed
                </span>
              )}
            </span>

            {!editing && (
              <div className="flex items-center gap-2">
                {!sealed && (
                  <button
                    onClick={() => setEditing(true)}
                    className="text-[11px] text-[var(--color-text-brand)] hover:underline underline-offset-2 transition-opacity"
                    aria-label="Edit entry"
                  >
                    Edit
                  </button>
                )}
                {confirmDelete ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-[var(--color-bloom-midnight-400)]">
                      Remove?
                    </span>
                    <button
                      onClick={() => onDelete(entry.id)}
                      className="text-[10px] text-red-500 font-medium hover:underline"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="text-[10px] text-[var(--color-text-muted)] hover:underline"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="text-[11px] text-[var(--color-text-muted)] hover:text-red-400 transition-colors"
                    aria-label="Delete entry"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function NewEntryComposer({
  onSave
}: {
  onSave: (text: string, emoji: string) => void;
}) {
  const [text, setText] = useState("");
  const [emoji, setEmoji] = useState("✨");
  const [showPicker, setShowPicker] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSave() {
    if (!text.trim()) return;
    onSave(text.trim(), emoji);
    setText("");
    setEmoji("✨");
    setExpanded(false);
  }

  return (
    <div
      className="card px-4 py-3.5 transition-all duration-200"
      style={{
        background:
          "linear-gradient(135deg, var(--color-bloom-petal-50), var(--color-bloom-rose-50))",
        border: "0.5px solid var(--color-border-soft)"
      }}
    >
      {!expanded ? (
        <button
          onClick={() => {
            setExpanded(true);
            setTimeout(() => textareaRef.current?.focus(), 50);
          }}
          className="w-full text-left text-[13px] text-[var(--color-text-muted)] font-[family-name:var(--font-display)] italic cursor-text"
        >
          What&apos;s on your mind right now?
        </button>
      ) : (
        <>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's on your mind right now?"
            rows={6}
            className="
              w-full text-[13px] text-[var(--color-text-primary)] leading-relaxed
              font-[family-name:var(--font-display)] italic placeholder:text-[var(--color-text-muted)]
              resize-none bg-transparent outline-none
            "
          />
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-border-soft)]">
            <div className="relative">
              <button
                onClick={() => setShowPicker((v) => !v)}
                className="flex items-center gap-1.5 text-sm px-2.5 py-1.5 rounded-xl hover:bg-[var(--color-bloom-rose-100)] transition-colors"
              >
                <span>{emoji}</span>
                <span className="text-[11px] text-[var(--color-text-muted)]">
                  sticker
                </span>
              </button>
              {showPicker && (
                <EmojiPicker
                  selected={emoji}
                  onSelect={setEmoji}
                  onClose={() => setShowPicker(false)}
                />
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setExpanded(false);
                  setText("");
                }}
                className="btn-ghost text-[11px] px-3 py-1.5"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!text.trim()}
                className="btn-primary text-[11px] px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add entry
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function DaySection({
  dateKey,
  entries,
  onEdit,
  onDelete
}: {
  dateKey: string;
  entries: JournalEntry[];
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}) {
  const today = isToday(dateKey);
  const label = today ? "Today" : formatDayLabel(dateKey);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`section-label ${today ? "text-[var(--color-bloom-rose-600)]" : "text-[var(--color-bloom-midnight-400)]"}`}
        >
          {label}
        </span>
        <span className="text-[10px] text-[var(--color-text-muted)]">
          {entries.length} {entries.length === 1 ? "note" : "notes"}
        </span>
        {today && (
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-bloom-rose-400)] animate-pulse" />
        )}
      </div>
      <div className="flex flex-col gap-2.5">
        {entries.map((e) => (
          <EntryCard
            key={e.id}
            entry={e}
            sealed={!today}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

function WeekStrip({
  days,
  entryCountByDate,
  selectedDateKey,
  onSelect
}: {
  days: ReturnType<typeof getLast28Days>;
  entryCountByDate: Record<string, number>;
  selectedDateKey: string;
  onSelect: (dateKey: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to end (today) on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {days.map((day) => {
        const count = entryCountByDate[day.dateKey] ?? 0;
        const selected = day.dateKey === selectedDateKey;
        const today = isToday(day.dateKey);

        return (
          <button
            key={day.dateKey}
            onClick={() => onSelect(day.dateKey)}
            className={`
              flex flex-col items-center gap-1 px-2.5 py-2.5 rounded-2xl shrink-0 cursor-pointer
              transition-all duration-200 active:scale-95
              ${
                selected
                  ? "bg-[var(--color-bloom-rose-500)] shadow-sm"
                  : today
                    ? "bg-[var(--color-bloom-rose-100)] border border-[var(--color-bloom-rose-300)]"
                    : "hover:bg-[var(--color-bloom-rose-50)]"
              }
            `}
          >
            <span
              className={`text-[10px] font-medium ${selected ? "text-white/70" : "text-[var(--color-text-muted)]"}`}
            >
              {day.dayName}
            </span>
            <span
              className={`text-[15px] font-medium leading-none ${selected ? "text-white" : today ? "text-[var(--color-bloom-rose-600)]" : "text-[var(--color-text-primary)]"}`}
            >
              {day.dayNum}
            </span>
            {/* Entry dot indicator */}
            <div className="h-1.5 flex items-center justify-center gap-0.5">
              {count === 0 ? (
                <span className="w-1 h-1 rounded-full bg-transparent" />
              ) : count === 1 ? (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${selected ? "bg-white/80" : "bg-[var(--color-bloom-rose-400)]"}`}
                />
              ) : (
                <>
                  <span
                    className={`w-1 h-1 rounded-full ${selected ? "bg-white/80" : "bg-[var(--color-bloom-rose-400)]"}`}
                  />
                  <span
                    className={`w-1 h-1 rounded-full ${selected ? "bg-white/60" : "bg-[var(--color-bloom-rose-300)]"}`}
                  />
                </>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function JournalPage() {
  const [selectedEntries, setSelectedEntries] = useState<JournalEntry[]>([]);
  const [selectedDateKey, setSelectedDateKey] = useState<string>(
    toDateKey(new Date())
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allEntries, setAllEntries] = useState<JournalEntry[]>([]);

  const days = getLast28Days();
  const today = toDateKey(new Date());

  // Fetch entries for the selected date
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiEntries = await fetchJournalEntries(selectedDateKey);
        const transformedEntries: JournalEntry[] = apiEntries.map((e) => ({
          id: e.id,
          text: e.text,
          emoji: e.emoji,
          timestamp: new Date(e.timestamp),
          dateKey: selectedDateKey
        }));
        setSelectedEntries(transformedEntries);

        // Update allEntries for the count sidebar
        setAllEntries((prev) => {
          const filtered = prev.filter((e) => e.dateKey !== selectedDateKey);
          return [...filtered, ...transformedEntries];
        });
      } catch (err) {
        console.error("Failed to fetch entries:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch entries"
        );
        setSelectedEntries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [selectedDateKey]);

  const todayEntries = allEntries.filter((e) => e.dateKey === today);

  const entryCountByDate = allEntries.reduce<Record<string, number>>(
    (acc, e) => {
      acc[e.dateKey] = (acc[e.dateKey] ?? 0) + 1;
      return acc;
    },
    {}
  );

  async function addEntry(text: string, emoji: string) {
    try {
      setError(null);
      const newEntry = await createJournalEntry({ text, emoji });
      const entry: JournalEntry = {
        id: newEntry.id,
        text: newEntry.text,
        emoji: newEntry.emoji,
        timestamp: new Date(newEntry.timestamp),
        dateKey: toDateKey(new Date())
      };
      setSelectedEntries((prev) => [...prev, entry]);
      setAllEntries((prev) => [...prev, entry]);
      setSelectedDateKey(today);
    } catch (err) {
      console.error("Failed to add entry:", err);
      setError(err instanceof Error ? err.message : "Failed to add entry");
    }
  }

  async function editEntry(id: string, newText: string) {
    try {
      setError(null);
      const updated = await updateJournalEntry(id, { text: newText });
      const entry: JournalEntry = {
        id: updated.id,
        text: updated.text,
        emoji: updated.emoji,
        timestamp: new Date(updated.timestamp),
        dateKey: selectedDateKey
      };
      setSelectedEntries((prev) => prev.map((e) => (e.id === id ? entry : e)));
      setAllEntries((prev) => prev.map((e) => (e.id === id ? entry : e)));
    } catch (err) {
      console.error("Failed to edit entry:", err);
      setError(err instanceof Error ? err.message : "Failed to edit entry");
    }
  }

  async function deleteEntry(id: string) {
    try {
      setError(null);
      await deleteJournalEntry(id);
      setSelectedEntries((prev) => prev.filter((e) => e.id !== id));
      setAllEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Failed to delete entry:", err);
      setError(err instanceof Error ? err.message : "Failed to delete entry");
    }
  }

  const isViewingToday = selectedDateKey === today;
  // const hasSelectedEntries = selectedEntries.length > 0;

  return (
    <div className="min-h-dvh bg-[var(--color-bg-page)] font-[family-name:var(--font-body)]">
      <div className="max-w-sm mx-auto pb-28">
        {/* ── Header ── */}
        <header
          className="px-5 py-3 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(160deg, var(--color-bloom-petal-50) 0%, var(--color-bloom-rose-50) 100%)"
          }}
        >
          <div
            aria-hidden
            className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-15 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, var(--color-bloom-petal-300), transparent 70%)"
            }}
          />
          <div className="relative">
            <p className="section-label mb-1">Your journal</p>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-normal text-[var(--color-bloom-midnight-600)] leading-tight">
              Daily{" "}
              <em className="italic text-[var(--color-bloom-rose-500)]">
                pages
              </em>
            </h1>
            <p className="text-[12px] text-[var(--color-text-secondary)] mt-1">
              {loading
                ? "Loading entries..."
                : todayEntries.length === 0
                  ? "Nothing written today yet — what's on your mind?"
                  : `${todayEntries.length} ${todayEntries.length === 1 ? "entry" : "entries"} today`}
            </p>
          </div>
        </header>

        {/* ── Error notification ── */}
        {error && (
          <div className="mx-4 mt-4 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200">
            <p className="text-[11px] text-red-600 text-center leading-relaxed">
              {error}
            </p>
          </div>
        )}

        {/* ── Calendar strip ── */}
        <section className="mt-4" aria-label="Date navigator">
          <WeekStrip
            days={days}
            entryCountByDate={entryCountByDate}
            selectedDateKey={selectedDateKey}
            onSelect={setSelectedDateKey}
          />
        </section>

        {/* ── New entry composer (only if today is selected) ── */}
        {isViewingToday && (
          <section className="mt-5 px-4" aria-label="Write new entry">
            <NewEntryComposer onSave={addEntry} />
          </section>
        )}

        {/* ── Entries for selected day ── */}
        <section className="mt-5 px-4" aria-label="Journal entries">
          {loading ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <span className="text-2xl animate-pulse">✨</span>
              <p className="text-[13px] text-[var(--color-text-muted)] font-[family-name:var(--font-display)] italic">
                Loading your pages...
              </p>
            </div>
          ) : selectedEntries.length > 0 ? (
            <DaySection
              dateKey={selectedDateKey}
              entries={selectedEntries
                .slice()
                .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())}
              onEdit={editEntry}
              onDelete={deleteEntry}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <span className="text-4xl opacity-40">🌿</span>
              <p className="text-[13px] text-[var(--color-text-muted)] font-[family-name:var(--font-display)] italic">
                {isViewingToday
                  ? "Use the box above to write your first entry today."
                  : "Nothing was written on this day."}
              </p>
            </div>
          )}
        </section>

        {/* ── Sealed notice for past days ── */}
        {!isViewingToday && selectedEntries.length > 0 && (
          <div className="mx-4 mt-3 px-3 py-2.5 rounded-xl bg-[var(--color-bloom-petal-50)] border border-[var(--color-bloom-petal-100)]">
            <p className="text-[11px] text-[var(--color-bloom-petal-600)] text-center leading-relaxed">
              🔒 These entries are sealed — past pages can&apos;t be edited, but
              you can remove them.
            </p>
          </div>
        )}
      </div>

      <BottomNav activeHref="/journal" />
    </div>
  );
}
