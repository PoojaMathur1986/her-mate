import { auth } from "@/app/lib/firebase";

interface JournalEntryPayload {
    text: string;
    emoji?: string;
}

interface JournalEntry {
    id: string;
    text: string;
    emoji: string;
    timestamp: string;
    createdAt: string;
    updatedAt: string;
}

interface JournalResponse {
    date: string;
    entries: JournalEntry[];
}

/**
 * Fetch journal entries for a specific date
 * @param date - Date in YYYY-MM-DD format (optional, defaults to today)
 */
export async function fetchJournalEntries(date?: string): Promise<JournalEntry[]> {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error("User not authenticated");
        }

        const idToken = await currentUser.getIdToken();

        const params = new URLSearchParams();
        if (date) {
            params.append("date", date);
        }

        const response = await fetch(`/api/journal?${params.toString()}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${idToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to fetch journal entries");
        }

        const data = (await response.json()) as JournalResponse;
        return data.entries;
    } catch (error) {
        console.error("Error fetching journal entries:", error);
        throw error;
    }
}

/**
 * Create a new journal entry
 */
export async function createJournalEntry(payload: JournalEntryPayload): Promise<JournalEntry> {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error("User not authenticated");
        }

        const idToken = await currentUser.getIdToken();

        const response = await fetch("/api/journal", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${idToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to create journal entry");
        }

        return (await response.json()) as JournalEntry;
    } catch (error) {
        console.error("Error creating journal entry:", error);
        throw error;
    }
}

/**
 * Update a journal entry (text and/or emoji)
 * Only allows updating entries from today
 */
export async function updateJournalEntry(
    entryId: string,
    updates: Partial<JournalEntryPayload>
): Promise<JournalEntry> {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error("User not authenticated");
        }

        const idToken = await currentUser.getIdToken();

        const response = await fetch(`/api/journal/${entryId}`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${idToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to update journal entry");
        }

        return (await response.json()) as JournalEntry;
    } catch (error) {
        console.error("Error updating journal entry:", error);
        throw error;
    }
}

/**
 * Delete (soft-delete) a journal entry
 * Can delete entries from any day
 */
export async function deleteJournalEntry(entryId: string): Promise<void> {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error("User not authenticated");
        }

        const idToken = await currentUser.getIdToken();

        const response = await fetch(`/api/journal/${entryId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${idToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to delete journal entry");
        }
    } catch (error) {
        console.error("Error deleting journal entry:", error);
        throw error;
    }
}
