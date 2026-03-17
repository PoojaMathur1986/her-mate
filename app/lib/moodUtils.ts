// ═══════════════════════════════════════════════════════════════════════════
// Mood Mapping Utilities
// Maps mood types to emoji, colors, and text styling
// ═══════════════════════════════════════════════════════════════════════════

export interface MoodDisplay {
    emoji: string;
    label: string;
    textColor: string;
}

const MOOD_MAP: Record<string, MoodDisplay> = {
    happy: {
        emoji: "😊",
        label: "Happy",
        textColor: "text-[#78520D]",
    },
    calm: {
        emoji: "😌",
        label: "Calm",
        textColor: "text-[#1C543B]",
    },
    excited: {
        emoji: "🤩",
        label: "Excited",
        textColor: "text-[#8B4513]",
    },
    loved: {
        emoji: "🥰",
        label: "Loved",
        textColor: "text-[#C2185B]",
    },
    meh: {
        emoji: "😐",
        label: "Meh",
        textColor: "text-[#8F4530]",
    },
    tired: {
        emoji: "😴",
        label: "Tired",
        textColor: "text-[#4D3346]",
    },
    anxious: {
        emoji: "😰",
        label: "Anxious",
        textColor: "text-[#612E85]",
    },
    frustrated: {
        emoji: "😤",
        label: "Frustrated",
        textColor: "text-[#663020]",
    },
    sad: {
        emoji: "😞",
        label: "Sad",
        textColor: "text-[#3D2535]",
    },
    angry: {
        emoji: "😡",
        label: "Angry",
        textColor: "text-[#6B1E3D]",
    },
};

/**
 * Get the display info for a mood type
 */
export function getMoodDisplay(moodType: string): MoodDisplay {
    return MOOD_MAP[moodType] || MOOD_MAP["meh"];
}

/**
 * Format a date to a readable string
 */
export function formatMoodDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        // Same day - show time
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    } else if (diffDays === 1) {
        return "Yesterday";
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    }
}
