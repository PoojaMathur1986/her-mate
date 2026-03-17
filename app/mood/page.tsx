"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/app/lib/ProtectedRoute";
import {
  saveMoodLog,
  checkMoodForCurrentSlot,
  updateMoodNote
} from "@/app/lib/moodClient";

// ─── Types ────────────────────────────────────────────────────────────────────

type MoodKey =
  | "happy"
  | "calm"
  | "excited"
  | "loved"
  | "meh"
  | "tired"
  | "anxious"
  | "frustrated"
  | "sad"
  | "angry";

type PageView = "loading" | "pick" | "view" | "note" | "done";

interface Mood {
  key: MoodKey;
  emoji: string;
  label: string;
  sublabel: string;
  pageBg: string;
  ringColor: string;
  glowColor: string;
  textColor: string;
  noteBg: string;
  notePlaceholder: string;
}

// ─── Mood definitions ─────────────────────────────────────────────────────────

const MOODS: Mood[] = [
  {
    key: "happy",
    emoji: "😊",
    label: "Happy",
    sublabel: "Warmth from the inside",
    pageBg: "linear-gradient(160deg, #FAF0D0 0%, #FDF8EE 100%)",
    ringColor: "#DFB030",
    glowColor: "rgba(223,176,48,0.30)",
    textColor: "#78520D",
    noteBg: "#FDF8EE",
    notePlaceholder: "What's making you happy today? ☀️"
  },
  {
    key: "calm",
    emoji: "😌",
    label: "Calm",
    sublabel: "Still and steady",
    pageBg: "linear-gradient(160deg, #D4EDE0 0%, #EEF7F2 100%)",
    ringColor: "#52A882",
    glowColor: "rgba(82,168,130,0.28)",
    textColor: "#1C543B",
    noteBg: "#EEF7F2",
    notePlaceholder: "What's helping you feel grounded? 🌿"
  },
  {
    key: "excited",
    emoji: "🤩",
    label: "Excited",
    sublabel: "Energy and anticipation",
    pageBg: "linear-gradient(160deg, #FCE0D0 0%, #FDF0EB 100%)",
    ringColor: "#E07B4A",
    glowColor: "rgba(224,123,74,0.30)",
    textColor: "#8B4513",
    noteBg: "#FDF0EB",
    notePlaceholder: "What's got you excited? 🎉"
  },
  {
    key: "loved",
    emoji: "🥰",
    label: "Loved / Appreciated",
    sublabel: "Feeling connected",
    pageBg: "linear-gradient(160deg, #FFE0F0 0%, #FFF5FA 100%)",
    ringColor: "#FF6B9D",
    glowColor: "rgba(255,107,157,0.28)",
    textColor: "#C2185B",
    noteBg: "#FFF5FA",
    notePlaceholder: "What makes you feel valued? 💕"
  },
  {
    key: "meh",
    emoji: "😐",
    label: "Meh",
    sublabel: "Just kind of… here",
    pageBg: "linear-gradient(160deg, #F7E2D4 0%, #FDF6F0 100%)",
    ringColor: "#E5A882",
    glowColor: "rgba(229,168,130,0.28)",
    textColor: "#8F4530",
    noteBg: "#FDF6F0",
    notePlaceholder: "Anything on your mind? No pressure… 💭"
  },
  {
    key: "tired",
    emoji: "😴",
    label: "Tired",
    sublabel: "Running on empty",
    pageBg: "linear-gradient(160deg, #E2D6DC 0%, #F4EFF2 100%)",
    ringColor: "#BDA8B4",
    glowColor: "rgba(189,168,180,0.28)",
    textColor: "#4D3346",
    noteBg: "#F4EFF2",
    notePlaceholder: "What's been draining you lately? 🌙"
  },
  {
    key: "anxious",
    emoji: "😰",
    label: "Anxious",
    sublabel: "Mind won't slow down",
    pageBg: "linear-gradient(160deg, #F0DEFA 0%, #F8F0FB 100%)",
    ringColor: "#B877DC",
    glowColor: "rgba(184,119,220,0.25)",
    textColor: "#612E85",
    noteBg: "#F8F0FB",
    notePlaceholder: "What's making you feel unsettled? 💜"
  },
  {
    key: "frustrated",
    emoji: "😤",
    label: "Frustrated",
    sublabel: "Things feel blocked",
    pageBg: "linear-gradient(160deg, #F7E2D4 0%, #FDF6F0 100%)",
    ringColor: "#D4845A",
    glowColor: "rgba(212,132,90,0.28)",
    textColor: "#663020",
    noteBg: "#FDF6F0",
    notePlaceholder: "What's getting in your way? Let it out 🔥"
  },
  {
    key: "sad",
    emoji: "😞",
    label: "Sad",
    sublabel: "Something aches today",
    pageBg: "linear-gradient(160deg, #E2D6DC 0%, #EEF7F2 100%)",
    ringColor: "#967A88",
    glowColor: "rgba(150,122,136,0.25)",
    textColor: "#3D2535",
    noteBg: "#F4EFF2",
    notePlaceholder: "What's weighing on your heart? 🫂"
  },
  {
    key: "angry",
    emoji: "😡",
    label: "Angry",
    sublabel: "This needed to be felt",
    pageBg: "linear-gradient(160deg, #FAE0EA 0%, #FDF2F6 100%)",
    ringColor: "#B83968",
    glowColor: "rgba(184,57,104,0.25)",
    textColor: "#6B1E3D",
    noteBg: "#FDF2F6",
    notePlaceholder: "Safe to say it here — what happened? 💢"
  }
];

// ─── Constants ────────────────────────────────────────────────────────────────

const HOLD_DURATION = 1500;
const RING_RADIUS = 32;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// ─── useLongPress hook ────────────────────────────────────────────────────────

function useLongPress(
  onComplete: () => void,
  onProgress: (p: number) => void,
  onCancel: () => void,
  duration = HOLD_DURATION
) {
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const activeRef = useRef(false);

  const start = useCallback(() => {
    activeRef.current = true;
    startRef.current = performance.now();

    const tick = (now: number) => {
      if (!activeRef.current) return;
      const progress = Math.min(
        (now - (startRef.current ?? now)) / duration,
        1
      );
      onProgress(progress);
      if (progress >= 1) {
        activeRef.current = false;
        onComplete();
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [onComplete, onProgress, duration]);

  const cancel = useCallback(() => {
    if (!activeRef.current) return;
    activeRef.current = false;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    startRef.current = null;
    onCancel();
  }, [onCancel]);

  useEffect(
    () => () => {
      activeRef.current = false;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  return { start, cancel };
}

// ─── MoodButton ───────────────────────────────────────────────────────────────

function MoodButton({
  mood,
  isActive,
  isAnyActive,
  progress,
  onStart,
  onEnd
}: {
  mood: Mood;
  isActive: boolean;
  isAnyActive: boolean;
  progress: number;
  onStart: () => void;
  onEnd: () => void;
}) {
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress);
  const isHolding = isActive && progress > 0 && progress < 1;
  const dimmed = isAnyActive && !isActive;

  return (
    <div
      className="flex flex-col items-center gap-1.5 select-none"
      style={{
        opacity: dimmed ? 0.3 : 1,
        transition: "opacity 0.2s ease"
      }}
    >
      {/* Press target */}
      <div
        className="relative flex items-center justify-center cursor-pointer"
        style={{ width: 72, height: 72 }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          onStart();
        }}
        onPointerUp={onEnd}
        onPointerLeave={onEnd}
        onPointerCancel={onEnd}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Glow disk */}
        {isHolding && (
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: mood.glowColor,
              transform: `scale(${1 + progress * 0.18})`,
              transition: "transform 0.08s",
              borderRadius: "50%"
            }}
          />
        )}

        {/* SVG ring */}
        <svg
          width="72"
          height="72"
          viewBox="0 0 72 72"
          className="absolute inset-0"
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            cx="36"
            cy="36"
            r={RING_RADIUS}
            fill="none"
            stroke={mood.ringColor}
            strokeWidth="2.5"
            opacity={isActive ? 0.22 : 0.1}
          />
          {isActive && (
            <circle
              cx="36"
              cy="36"
              r={RING_RADIUS}
              fill="none"
              stroke={mood.ringColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 0.04s linear" }}
            />
          )}
        </svg>

        {/* Emoji */}
        <span
          className="relative z-10 leading-none noto-color-emoji"
          style={{
            fontSize: 34,
            transform: isHolding ? `scale(${1 + progress * 0.14})` : "scale(1)",
            transition: "transform 0.08s ease",
            filter: isHolding
              ? `drop-shadow(0 0 ${10 * progress}px ${mood.glowColor})`
              : "none"
          }}
        >
          {mood.emoji}
        </span>
      </div>

      {/* Label */}
      <p
        className="text-[11px] font-medium text-center leading-tight"
        style={{
          color: isActive ? mood.textColor : "var(--color-text-secondary)",
          transition: "color 0.2s"
        }}
      >
        {mood.label}
      </p>
    </div>
  );
}

// ─── NoteSheet ────────────────────────────────────────────────────────────────

function NoteSheet({
  mood,
  onSave,
  onSkip
}: {
  mood: Mood;
  onSave: (note: string) => void;
  onSkip: () => void;
}) {
  const [note, setNote] = useState("");
  const [visible, setVisible] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 30);
    const t2 = setTimeout(() => textareaRef.current?.focus(), 350);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  function handleSave() {
    setVisible(false);
    setTimeout(() => onSave(note.trim()), 260);
  }

  function handleSkip() {
    setVisible(false);
    setTimeout(onSkip, 260);
  }

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col"
      style={{ background: mood.pageBg }}
    >
      {/* Back / cancel button */}
      <button
        onClick={handleSkip}
        className="absolute top-12 left-5 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/50 backdrop-blur-sm border border-[var(--color-border-soft)] text-[var(--color-text-secondary)] active:scale-95 transition-transform"
        aria-label="Back"
      >
        ←
      </button>

      {/* Top — mood identity */}
      <div
        className="flex-1 flex flex-col items-center justify-end pb-8 px-6"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.3s ease, transform 0.3s ease"
        }}
      >
        <span
          className="leading-none mb-5 noto-color-emoji"
          style={{
            fontSize: 72,
            filter: `drop-shadow(0 6px 24px ${mood.glowColor})`
          }}
        >
          {mood.emoji}
        </span>

        <p
          className="font-[family-name:var(--font-display)] italic text-[1.6rem] leading-tight"
          style={{ color: mood.textColor }}
        >
          {mood.label}
        </p>
        <p
          className="text-[13px] mt-1 font-[family-name:var(--font-display)] italic"
          style={{ color: mood.textColor, opacity: 0.65 }}
        >
          {mood.sublabel}
        </p>
      </div>

      {/* Bottom sheet */}
      <div
        className="rounded-t-[28px] px-5 pt-5 flex flex-col gap-3"
        style={{
          background: mood.noteBg,
          boxShadow: "0 -4px 40px rgba(61,37,53,0.09)",
          paddingBottom: "max(2rem, env(safe-area-inset-bottom, 2rem))",
          transform: visible ? "translateY(0)" : "translateY(72px)",
          transition: "transform 0.38s cubic-bezier(0.32, 0.72, 0, 1)"
        }}
      >
        {/* Drag handle */}
        <div className="w-8 h-1 rounded-full bg-[var(--color-border-medium)] mx-auto mb-1" />

        {/* Label */}
        <p className="section-label">Want to say more about it?</p>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={mood.notePlaceholder}
          maxLength={280}
          rows={4}
          className="w-full resize-none rounded-2xl px-4 py-3 text-[14px] leading-relaxed outline-none border font-[family-name:var(--font-display)] italic"
          style={{
            background: "rgba(255,255,255,0.72)",
            borderColor: "var(--color-border-soft)",
            color: "var(--color-text-primary)",
            caretColor: mood.ringColor,
            transition: "border-color 0.15s, box-shadow 0.15s"
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = mood.ringColor;
            e.currentTarget.style.boxShadow = `0 0 0 3px ${mood.glowColor}`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--color-border-soft)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />

        {/* Char count */}
        <p
          className="text-[10px] text-right -mt-1"
          style={{ color: "var(--color-text-muted)" }}
        >
          {note.length} / 280
        </p>

        {/* Buttons */}
        <div className="flex gap-3 mt-1">
          <button
            onClick={handleSkip}
            className="flex-1 py-3 rounded-full border text-[14px] font-medium active:scale-[0.97] transition-transform"
            style={{
              borderColor: "var(--color-border-medium)",
              color: "var(--color-text-secondary)",
              background: "rgba(255,255,255,0.5)"
            }}
          >
            Skip
          </button>
          <button
            onClick={handleSave}
            className="flex-[2] py-3 rounded-full text-[14px] font-medium text-white active:scale-[0.97] transition-transform"
            style={{
              background: mood.ringColor,
              boxShadow: `0 4px 18px ${mood.glowColor}`
            }}
          >
            Save mood
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ViewMoodSheet ────────────────────────────────────────────────────────────

function ViewMoodSheet({
  mood,
  initialNote,
  onSave,
  onClose
}: {
  mood: Mood;
  initialNote: string;
  onSave: (note: string) => void;
  onClose: () => void;
}) {
  const [note, setNote] = useState(initialNote);
  const [visible, setVisible] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 30);
    const t2 = setTimeout(() => textareaRef.current?.focus(), 350);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  function handleSave() {
    setVisible(false);
    setTimeout(() => onSave(note.trim()), 260);
  }

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 260);
  }

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col"
      style={{ background: mood.pageBg }}
    >
      {/* Back button */}
      <button
        onClick={handleClose}
        className="absolute top-12 left-5 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/50 backdrop-blur-sm border border-[var(--color-border-soft)] text-[var(--color-text-secondary)] active:scale-95 transition-transform"
        aria-label="Back"
      >
        ←
      </button>

      {/* Top — mood identity (read-only) */}
      <div
        className="flex-1 flex flex-col items-center justify-end pb-8 px-6"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.3s ease, transform 0.3s ease"
        }}
      >
        <span
          className="leading-none mb-5 noto-color-emoji"
          style={{
            fontSize: 72,
            filter: `drop-shadow(0 6px 24px ${mood.glowColor})`
          }}
        >
          {mood.emoji}
        </span>

        <p
          className="font-[family-name:var(--font-display)] italic text-[1.6rem] leading-tight"
          style={{ color: mood.textColor }}
        >
          {mood.label}
        </p>
        <p
          className="text-[13px] mt-1 font-[family-name:var(--font-display)] italic"
          style={{ color: mood.textColor, opacity: 0.65 }}
        >
          {mood.sublabel}
        </p>
        <p
          className="text-[11px] font-medium mt-4 tracking-widest uppercase"
          style={{ color: mood.textColor, opacity: 0.45 }}
        >
          Already logged ✓
        </p>
      </div>

      {/* Bottom sheet */}
      <div
        className="rounded-t-[28px] px-5 pt-5 flex flex-col gap-3"
        style={{
          background: mood.noteBg,
          boxShadow: "0 -4px 40px rgba(61,37,53,0.09)",
          paddingBottom: "max(2rem, env(safe-area-inset-bottom, 2rem))",
          transform: visible ? "translateY(0)" : "translateY(72px)",
          transition: "transform 0.38s cubic-bezier(0.32, 0.72, 0, 1)"
        }}
      >
        {/* Drag handle */}
        <div className="w-8 h-1 rounded-full bg-[var(--color-border-medium)] mx-auto mb-1" />

        {/* Label */}
        <p className="section-label">Update your note</p>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={mood.notePlaceholder}
          maxLength={280}
          rows={4}
          className="w-full resize-none rounded-2xl px-4 py-3 text-[14px] leading-relaxed outline-none border font-[family-name:var(--font-display)] italic"
          style={{
            background: "rgba(255,255,255,0.72)",
            borderColor: "var(--color-border-soft)",
            color: "var(--color-text-primary)",
            caretColor: mood.ringColor,
            transition: "border-color 0.15s, box-shadow 0.15s"
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = mood.ringColor;
            e.currentTarget.style.boxShadow = `0 0 0 3px ${mood.glowColor}`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--color-border-soft)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />

        {/* Char count */}
        <p
          className="text-[10px] text-right -mt-1"
          style={{ color: "var(--color-text-muted)" }}
        >
          {note.length} / 280
        </p>

        {/* Buttons */}
        <div className="flex gap-3 mt-1">
          <button
            onClick={handleClose}
            className="flex-1 py-3 rounded-full border text-[14px] font-medium active:scale-[0.97] transition-transform"
            style={{
              borderColor: "var(--color-border-medium)",
              color: "var(--color-text-secondary)",
              background: "rgba(255,255,255,0.5)"
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-[2] py-3 rounded-full text-[14px] font-medium text-white active:scale-[0.97] transition-transform"
            style={{
              background: mood.ringColor,
              boxShadow: `0 4px 18px ${mood.glowColor}`
            }}
          >
            Update note
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DoneView ─────────────────────────────────────────────────────────────────

function DoneView({ mood, hasNote }: { mood: Mood; hasNote: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 px-8"
      style={{
        background: mood.pageBg,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.35s ease"
      }}
    >
      <span
        className="leading-none noto-color-emoji"
        style={{
          fontSize: 80,
          filter: `drop-shadow(0 6px 28px ${mood.glowColor})`,
          transform: visible ? "scale(1)" : "scale(0.65)",
          transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)"
        }}
      >
        {mood.emoji}
      </span>

      <div className="text-center">
        <p
          className="font-[family-name:var(--font-display)] italic text-2xl leading-snug"
          style={{ color: mood.textColor }}
        >
          {mood.label}
        </p>
        <p
          className="text-[14px] mt-1 font-[family-name:var(--font-display)] italic"
          style={{ color: mood.textColor, opacity: 0.65 }}
        >
          {mood.sublabel}
        </p>
      </div>

      <p
        className="text-[11px] font-medium tracking-widest uppercase"
        style={{ color: mood.textColor, opacity: 0.45 }}
      >
        {hasNote ? "Mood & note saved ✓" : "Mood logged ✓"}
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function MoodPageContent() {
  const router = useRouter();

  const [view, setView] = useState<PageView>("loading");
  const [activeMood, setActiveMood] = useState<MoodKey | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [pendingMood, setPendingMood] = useState<Mood | null>(null);
  const [savedMood, setSavedMood] = useState<Mood | null>(null);
  const [savedHasNote, setSavedHasNote] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Existing mood state
  const [existingMoodId, setExistingMoodId] = useState<string | null>(null);
  const [existingMoodKey, setExistingMoodKey] = useState<MoodKey | null>(null);
  const [existingNote, setExistingNote] = useState<string>("");

  const activeMoodObj = MOODS.find((m) => m.key === activeMood) ?? null;
  const pendingMoodRef = useRef<Mood | null>(null);

  // Check for existing mood in current slot on mount
  useEffect(() => {
    const checkExistingMood = async () => {
      try {
        const result = await checkMoodForCurrentSlot();
        if (result.success && result.data?.exists && result.data?.mood) {
          // Mood already exists for this slot
          const existingMoodKey = result.data.mood as MoodKey;
          setExistingMoodId(result.data.id || null);
          setExistingMoodKey(existingMoodKey);
          setExistingNote(result.data.note || "");
          setView("view");
        } else {
          // No existing mood, show picker
          setView("pick");
        }
      } catch (error) {
        console.error("Failed to check existing mood:", error);
        setView("pick"); // Default to picker on error
      }
    };

    checkExistingMood();
  }, []);

  // ── Long-press callbacks ──
  const handleComplete = useCallback(() => {
    const mood = pendingMoodRef.current;
    if (!mood) return;
    setTimeout(() => {
      setPendingMood(mood);
      setActiveMood(null);
      setHoldProgress(0);
      setView("note");
    }, 200);
  }, []);

  const handleProgress = useCallback((p: number) => setHoldProgress(p), []);
  const handleCancel = useCallback(() => setHoldProgress(0), []);

  // All 10 hooks — must be unconditional, at top level
  const lp = {
    happy: useLongPress(handleComplete, handleProgress, handleCancel),
    calm: useLongPress(handleComplete, handleProgress, handleCancel),
    excited: useLongPress(handleComplete, handleProgress, handleCancel),
    loved: useLongPress(handleComplete, handleProgress, handleCancel),
    meh: useLongPress(handleComplete, handleProgress, handleCancel),
    tired: useLongPress(handleComplete, handleProgress, handleCancel),
    anxious: useLongPress(handleComplete, handleProgress, handleCancel),
    frustrated: useLongPress(handleComplete, handleProgress, handleCancel),
    sad: useLongPress(handleComplete, handleProgress, handleCancel),
    angry: useLongPress(handleComplete, handleProgress, handleCancel)
  } as const;

  function startPress(key: MoodKey) {
    pendingMoodRef.current = MOODS.find((m) => m.key === key)!;
    setActiveMood(key);
    setHoldProgress(0);
    lp[key].start();
  }

  function endPress(key: MoodKey) {
    lp[key].cancel();
    setActiveMood(null);
    setHoldProgress(0);
    pendingMoodRef.current = null;
  }

  // ── Note sheet resolution ──
  async function handleSaveNote(note: string) {
    if (!pendingMood || isSaving) return;

    setIsSaving(true);
    try {
      // Call API to save mood
      await saveMoodLog({
        mood: pendingMood.key,
        note: note.trim() || ""
      });

      const hasNote = note.length > 0;
      setSavedMood(pendingMood);
      setSavedHasNote(hasNote);
      setView("done");
      setTimeout(() => router.push("/"), 2400);
    } catch (error) {
      console.error("Failed to save mood:", error);
      // TODO: Show error toast/notification to user
      setIsSaving(false);
    }
  }

  function handleSkipNote() {
    handleSaveNote("");
  }

  // ── View mood handlers ──
  async function handleUpdateNote(note: string) {
    if (!existingMoodId || isSaving) return;

    setIsSaving(true);
    try {
      // Call API to update mood note
      await updateMoodNote(existingMoodId, note.trim());

      setExistingNote(note);
      setSavedMood(MOODS.find((m) => m.key === existingMoodKey) || null);
      setSavedHasNote(note.trim().length > 0);
      setView("done");
      setTimeout(() => router.push("/"), 2400);
    } catch (error) {
      console.error("Failed to update mood:", error);
      // TODO: Show error toast/notification to user
      setIsSaving(false);
    }
  }

  function handleCloseView() {
    router.back();
  }

  // ── Time greeting ──
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // ── Mood categories ──
  const positiveRow = MOODS.filter((m) =>
    ["happy", "calm", "excited", "loved"].includes(m.key)
  );
  const neutralRow = MOODS.filter((m) => ["meh", "tired"].includes(m.key));
  const challengingRow = MOODS.filter((m) =>
    ["anxious", "frustrated", "sad", "angry"].includes(m.key)
  );

  return (
    <>
      {view === "loading" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[linear-gradient(160deg,_var(--color-bloom-blush-100)_0%,_var(--color-bloom-rose-50)_100%)]">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-[var(--color-border-soft)] border-t-[var(--color-text-brand)] animate-spin mx-auto mb-4" />
            <p className="text-sm text-[var(--color-text-secondary)]">
              Loading...
            </p>
          </div>
        </div>
      )}

      {view === "note" && pendingMood && (
        <NoteSheet
          mood={pendingMood}
          onSave={handleSaveNote}
          onSkip={handleSkipNote}
        />
      )}

      {view === "view" && existingMoodKey && (
        <ViewMoodSheet
          mood={MOODS.find((m) => m.key === existingMoodKey)!}
          initialNote={existingNote}
          onSave={handleUpdateNote}
          onClose={handleCloseView}
        />
      )}

      {view === "done" && savedMood && (
        <DoneView mood={savedMood} hasNote={savedHasNote} />
      )}

      {/* ── Picker ── */}
      {view === "pick" && (
        <div
          className="min-h-dvh flex flex-col font-[family-name:var(--font-body)]"
          style={{
            background: activeMoodObj
              ? activeMoodObj.pageBg
              : "linear-gradient(160deg, var(--color-bloom-blush-100) 0%, var(--color-bloom-rose-50) 100%)",
            transition: "background 0.45s ease"
          }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 pt-12 pb-0">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/50 backdrop-blur-sm border border-[var(--color-border-soft)] text-[var(--color-text-secondary)] active:scale-95 transition-transform"
              aria-label="Go back"
            >
              ←
            </button>
            <p className="section-label">{greeting}</p>
            <div className="w-9" aria-hidden />
          </div>

          {/* Heading */}
          <div className="px-6 pt-6 pb-4 text-center">
            <h1
              className="font-[family-name:var(--font-display)] text-[1.55rem] font-normal leading-snug transition-colors duration-400"
              style={{
                color: activeMoodObj
                  ? activeMoodObj.textColor
                  : "var(--color-bloom-midnight-600)"
              }}
            >
              How are you{" "}
              <em
                className="italic"
                style={{ color: "var(--color-bloom-rose-500)" }}
              >
                really
              </em>{" "}
              feeling?
            </h1>

            <p
              className="text-[13px] mt-2.5 font-[family-name:var(--font-display)] italic transition-all duration-300"
              style={{
                color: activeMoodObj
                  ? activeMoodObj.textColor
                  : "var(--color-text-muted)",
                opacity: 0.8
              }}
            >
              {activeMood && holdProgress > 0
                ? "Keep holding…"
                : "Press and hold the one that feels right"}
            </p>
          </div>

          {/* Mood grid — 3 categories */}
          <div className="flex-1 flex flex-col justify-center gap-6 px-4 py-2">
            {/* Positive moods */}
            <div>
              <p
                className="text-xs font-semibold uppercase letter-spacing mb-2.5 px-1"
                style={{ color: "var(--color-text-muted)" }}
              >
                ✨ Positive moods
              </p>
              <div className="grid grid-cols-4 gap-1">
                {positiveRow.map((mood) => (
                  <MoodButton
                    key={mood.key}
                    mood={mood}
                    isActive={activeMood === mood.key}
                    isAnyActive={activeMood !== null}
                    progress={activeMood === mood.key ? holdProgress : 0}
                    onStart={() => startPress(mood.key)}
                    onEnd={() => endPress(mood.key)}
                  />
                ))}
              </div>
            </div>

            {/* Neutral / low energy moods */}
            <div>
              <p
                className="text-xs font-semibold uppercase letter-spacing mb-2.5 px-1"
                style={{ color: "var(--color-text-muted)" }}
              >
                😐 Neutral / Low Energy
              </p>
              <div className="grid grid-cols-4 gap-1">
                {neutralRow.map((mood) => (
                  <MoodButton
                    key={mood.key}
                    mood={mood}
                    isActive={activeMood === mood.key}
                    isAnyActive={activeMood !== null}
                    progress={activeMood === mood.key ? holdProgress : 0}
                    onStart={() => startPress(mood.key)}
                    onEnd={() => endPress(mood.key)}
                  />
                ))}
              </div>
            </div>

            {/* Challenging moods */}
            <div>
              <p
                className="text-xs font-semibold uppercase letter-spacing mb-2.5 px-1"
                style={{ color: "var(--color-text-muted)" }}
              >
                ⚡ Challenging Moods
              </p>
              <div className="grid grid-cols-4 gap-1">
                {challengingRow.map((mood) => (
                  <MoodButton
                    key={mood.key}
                    mood={mood}
                    isActive={activeMood === mood.key}
                    isAnyActive={activeMood !== null}
                    progress={activeMood === mood.key ? holdProgress : 0}
                    onStart={() => startPress(mood.key)}
                    onEnd={() => endPress(mood.key)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-12 pt-4 text-center">
            <p
              className="text-[11px] font-medium tracking-wide transition-opacity duration-200"
              style={{
                color: "var(--color-text-muted)",
                opacity: activeMood ? 0 : 1
              }}
            >
              Your feelings are private and safe here 🔒
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default function MoodPage() {
  return (
    <ProtectedRoute>
      <MoodPageContent />
    </ProtectedRoute>
  );
}
