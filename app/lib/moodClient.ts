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
