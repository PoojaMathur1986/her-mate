// ═══════════════════════════════════════════════════════════════════════════
// Mood API Client
// Utilities for calling mood save endpoints
// ═══════════════════════════════════════════════════════════════════════════

import { auth } from "./firebase";

interface MoodSavePayload {
    mood: string;
    note?: string;
}

interface MoodSaveResponse {
    success: boolean;
    data?: {
        id: string;
        userId: string;
        mood: string;
        note: string | null;
        slot: string;
        category: string;
        createdAt: string;
    };
    error?: string;
}

interface CheckMoodResponse {
    success: boolean;
    data?: {
        id?: string;
        exists: boolean;
        mood?: string;
        note?: string | null;
        slot: string;
        createdAt?: string;
    };
    error?: string;
}

interface UpdateMoodResponse {
    success: boolean;
    data?: {
        id: string;
        mood: string;
        note: string | null;
        slot: string;
        category: string;
        updatedAt: string;
    };
    error?: string;
}

/**
 * Saves a mood log to the database.
 * Requires the user to be authenticated with Firebase.
 *
 * @param payload - The mood data to save
 * @returns The saved mood record
 * @throws An error if the request fails
 */
export async function saveMoodLog(
    payload: MoodSavePayload
): Promise<MoodSaveResponse> {
    try {
        // Get the Firebase ID token
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error("User not authenticated");
        }

        const idToken = await currentUser.getIdToken();

        // Call the API
        const response = await fetch("/api/mood", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify(payload),
        });

        const data = (await response.json()) as MoodSaveResponse;

        if (!response.ok) {
            throw new Error(data.error || "Failed to save mood");
        }

        return data;
    } catch (error) {
        console.error("Error saving mood:", error);
        throw error;
    }
}

/**
 * Checks if a mood already exists for the current time slot.
 *
 * @returns The existing mood record if found, or indicates no mood exists
 * @throws An error if the request fails
 */
export async function checkMoodForCurrentSlot(): Promise<CheckMoodResponse> {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error("User not authenticated");
        }

        const idToken = await currentUser.getIdToken();

        const response = await fetch("/api/mood/check", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${idToken}`,
            },
        });

        const data = (await response.json()) as CheckMoodResponse;

        if (!response.ok) {
            throw new Error(data.error || "Failed to check mood");
        }

        return data;
    } catch (error) {
        console.error("Error checking mood:", error);
        throw error;
    }
}

/**
 * Updates the note for an existing mood log.
 *
 * @param moodId - The ID of the mood to update
 * @param note - The new note text
 * @returns The updated mood record
 * @throws An error if the request fails
 */
export async function updateMoodNote(
    moodId: string,
    note: string
): Promise<UpdateMoodResponse> {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error("User not authenticated");
        }

        const idToken = await currentUser.getIdToken();

        const response = await fetch(`/api/mood/${moodId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({ note }),
        });

        const data = (await response.json()) as UpdateMoodResponse;

        if (!response.ok) {
            throw new Error(data.error || "Failed to update mood");
        }

        return data;
    } catch (error) {
        console.error("Error updating mood:", error);
        throw error;
    }
}
