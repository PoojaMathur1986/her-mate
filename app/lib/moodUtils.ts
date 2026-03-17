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
 * Format a date to a readable string with proper timezone handling
 * Compares local date boundaries to determine day offset
 */
export function formatMoodDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();

    // Get local date components (year, month, day)
    const dateYear = date.getFullYear();
    const dateMonth = date.getMonth();
    const dateDay = date.getDate();

    const nowYear = now.getFullYear();
    const nowMonth = now.getMonth();
    const nowDay = now.getDate();

    // Calculate day difference using local date boundaries
    const isSameDay = dateYear === nowYear && dateMonth === nowMonth && dateDay === nowDay;
    const isYesterday =
        dateYear === nowYear &&
        dateMonth === nowMonth &&
        dateDay === nowDay - 1;
    const daysDiff = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Format time
    const timeStr = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });

    if (isSameDay) {
        return `Today at ${timeStr}`;
    } else if (isYesterday) {
        return `Yesterday at ${timeStr}`;
    } else if (daysDiff < 7) {
        return `${daysDiff} days ago at ${timeStr}`;
    } else {
        const dateStr = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
        return `${dateStr} at ${timeStr}`;
    }
}
