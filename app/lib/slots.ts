// ═══════════════════════════════════════════════════════════════════════════
// Slot Utilities
// Determine time slots based on current hour
// ═══════════════════════════════════════════════════════════════════════════

export type DaySlot = "morning" | "afternoon" | "evening" | "night";

/**
 * Determines the current time slot based on the current hour.
 * - morning: 05:00–11:59
 * - afternoon: 12:00–16:59
 * - evening: 17:00–20:59
 * - night: 21:00–04:59
 */
export function getCurrentSlot(): DaySlot {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
}

/**
 * Determines the mood category based on mood type.
 */
export function getMoodCategory(
    mood: string
): "positive" | "neutral" | "challenging" {
    const positiveList = ["happy", "calm", "excited", "loved"];
    const neutralList = ["meh", "tired"];

    if (positiveList.includes(mood)) return "positive";
    if (neutralList.includes(mood)) return "neutral";
    return "challenging";
}
