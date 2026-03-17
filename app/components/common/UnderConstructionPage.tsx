"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// ─── Falling petal animation ────────────────────────────────────────────────

const PETALS = ["🌸", "🌺", "🌷", "💮", "🪷"];

function FallingPetal({ style }: { style: React.CSSProperties }) {
  return (
    <span
      aria-hidden
      className="petal-fall pointer-events-none select-none absolute text-xl"
      style={style}
    />
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

interface UnderConstructionProps {
  title?: string;
  description?: string;
  emoji?: string;
  showPetals?: boolean;
}

export function UnderConstructionPage({
  title = "Still in the making, babe.",
  description = "This page is having a glow-up. Our team is sprinkling some magic on it — check back soon. ✨",
  emoji = "🚧",
  showPetals = true
}: UnderConstructionProps) {
  const [petals, setPetals] = useState<
    { id: number; emoji: string; style: React.CSSProperties }[]
  >([]);
  const [blink, setBlink] = useState(false);

  // Spawn petals periodically
  useEffect(() => {
    if (!showPetals) return;

    let counter = 0;
    const spawn = () => {
      const id = counter++;
      const petalEmoji = PETALS[Math.floor(Math.random() * PETALS.length)];
      const left = Math.random() * 90 + 5;
      const delay = Math.random() * 0.8;
      const duration = 4 + Math.random() * 3;
      const size = 14 + Math.random() * 12;

      setPetals((prev) => [
        ...prev.slice(-14),
        {
          id,
          emoji: petalEmoji,
          style: {
            left: `${left}%`,
            top: "-2rem",
            fontSize: `${size}px`,
            animation: `petalFall ${duration}s ${delay}s ease-in forwards`
          }
        }
      ]);
    };

    spawn();
    const iv = setInterval(spawn, 900);
    return () => clearInterval(iv);
  }, [showPetals]);

  // Blinking indicator
  useEffect(() => {
    const iv = setInterval(() => setBlink((b) => !b), 900);
    return () => clearInterval(iv);
  }, []);

  const wittyLines = [
    "She's getting her nails done and will be right back.",
    "Currently deep-conditioning. Back in 20.",
    "In a meeting with herself. Do not disturb.",
    "Filing her feelings. Cabinet full. One moment.",
    "Out picking wildflowers. She'll bloom soon."
  ];

  const witty = wittyLines[Math.floor(Math.random() * wittyLines.length)];

  return (
    <>
      {/* ── Injected keyframes ── */}
      <style>{`
        @keyframes petalFall {
          0%   { transform: translateY(0) rotate(0deg) scale(1);   opacity: 0; }
          10%  { opacity: 1; }
          80%  { opacity: 0.85; }
          100% { transform: translateY(105vh) rotate(360deg) scale(0.7); opacity: 0; }
        }

        @keyframes floatBob {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50%       { transform: translateY(-10px) rotate(2deg); }
        }

        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0px 0px rgba(212, 83, 126, 0.25); }
          50%       { box-shadow: 0 0 24px 6px rgba(212, 83, 126, 0.22); }
        }

        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .float-bob    { animation: floatBob 4s ease-in-out infinite; }
        .pulse-glow   { animation: pulseGlow 2.8s ease-in-out infinite; }

        .shimmer-text {
          background: linear-gradient(
            90deg,
            var(--color-bloom-rose-400) 0%,
            var(--color-bloom-petal-400) 40%,
            var(--color-bloom-rose-500) 60%,
            var(--color-bloom-honey-400) 80%,
            var(--color-bloom-rose-400) 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3.5s linear infinite;
        }

        .fade-up-1 { animation: fadeSlideUp 0.55s 0.1s both; }
        .fade-up-2 { animation: fadeSlideUp 0.55s 0.25s both; }
        .fade-up-3 { animation: fadeSlideUp 0.55s 0.40s both; }
        .fade-up-4 { animation: fadeSlideUp 0.55s 0.55s both; }
        .fade-up-5 { animation: fadeSlideUp 0.55s 0.70s both; }
      `}</style>

      <div
        className="relative min-h-dvh overflow-hidden flex flex-col"
        style={{
          background:
            "linear-gradient(165deg, var(--color-bloom-blush-50) 0%, var(--color-bloom-rose-50) 55%, var(--color-bloom-petal-50) 100%)"
        }}
      >
        {/* ── Falling petals layer ── */}
        {showPetals && (
          <div
            aria-hidden
            className="absolute inset-0 overflow-hidden pointer-events-none z-10"
          >
            {petals.map((p) => (
              <FallingPetal key={p.id} style={p.style} />
            ))}
          </div>
        )}

        {/* ── Decorative bg blobs ── */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none overflow-hidden"
        >
          <div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-15"
            style={{
              background:
                "radial-gradient(circle, var(--color-bloom-rose-300), transparent 65%)"
            }}
          />
          <div
            className="absolute top-1/3 -left-16 w-52 h-52 rounded-full opacity-10"
            style={{
              background:
                "radial-gradient(circle, var(--color-bloom-petal-300), transparent 65%)"
            }}
          />
          <div
            className="absolute bottom-10 right-4 w-48 h-48 rounded-full opacity-10"
            style={{
              background:
                "radial-gradient(circle, var(--color-bloom-honey-300), transparent 65%)"
            }}
          />
        </div>

        {/* ── Main content ── */}
        <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-sm mx-auto w-full">
          {/* Illustration */}
          <div className="fade-up-1 mb-6">
            <div
              className="float-bob pulse-glow relative inline-flex items-center justify-center w-32 h-32 rounded-[2rem]"
              style={{
                background:
                  "linear-gradient(145deg, var(--color-bloom-rose-100), var(--color-bloom-petal-100))"
              }}
            >
              <span className="text-6xl select-none">{emoji}</span>
              <span
                className="absolute top-3 right-3 w-3 h-3 rounded-full transition-opacity duration-300"
                style={{
                  background: "var(--color-bloom-honey-400)",
                  opacity: blink ? 1 : 0.15,
                  boxShadow: blink
                    ? "0 0 8px 2px var(--color-bloom-honey-300)"
                    : "none"
                }}
              />
            </div>
          </div>

          {/* Headline */}
          <div className="fade-up-2">
            <p className="section-label mb-2">Oops, she&apos;s not ready yet</p>
            <h1
              className="shimmer-text font-[family-name:var(--font-display)] font-normal leading-tight mb-1"
              style={{ fontSize: "clamp(2rem, 8vw, 2.5rem)" }}
            >
              {title}
            </h1>
          </div>

          {/* Witty subtitle */}
          <div className="fade-up-3 mt-4 mb-1">
            <div
              className="relative px-5 py-4 rounded-2xl"
              style={{
                background: "rgba(253,242,246,0.75)",
                backdropFilter: "blur(8px)",
                border: "0.5px solid var(--color-border-soft)"
              }}
            >
              <p className="pull-quote text-[14px] m-0">&quot;{witty}&quot;</p>
            </div>
          </div>

          {/* Supporting copy */}
          <div className="fade-up-3 mt-5 px-2">
            <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
              {description}
            </p>
          </div>

          {/* Progress dots (decorative "we're working on it") */}
          <div className="fade-up-4 flex items-center gap-2 mt-6">
            {["Planning 🗒️", "Building 🔨", "Polishing 💅"].map((step, i) => (
              <div key={step} className="flex flex-col items-center gap-1">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                  style={{
                    background:
                      i < 2
                        ? "var(--color-bloom-rose-200)"
                        : "var(--color-bloom-blush-100)",
                    opacity: i < 2 ? 1 : 0.5
                  }}
                >
                  {step.split(" ")[1]}
                </div>
                <span className="text-[9px] font-medium text-[var(--color-text-muted)] tracking-wide">
                  {step.split(" ")[0]}
                </span>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="fade-up-5 flex flex-col gap-3 w-full mt-8">
            <Link href="/" className="btn-primary text-sm text-center">
              Take me home 🌸
            </Link>
            <Link href="/journal" className="btn-ghost text-sm text-center">
              Write how you feel about this 📖
            </Link>
          </div>

          {/* Tiny joke footnote */}
          <p className="fade-up-5 text-[10px] text-[var(--color-text-muted)] mt-6 leading-relaxed">
            * No feelings were harmed in the making of this page.
          </p>
        </main>

        {/* ── Bottom wordmark ── */}
        <footer className="relative z-20 pb-8 text-center">
          <p className="font-[family-name:var(--font-display)] italic text-[var(--color-bloom-rose-400)] text-sm opacity-70">
            HerMate
          </p>
        </footer>
      </div>
    </>
  );
}
