// ═══════════════════════════════════════════════════════════════════════════
// API Route: Save Mood Log
// POST /api/mood
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { DaySlot, MoodCategory, MoodType, PrismaClient } from "@prisma/client";
import { adminAuth } from "@/app/lib/firebaseAdmin";
import { getCurrentSlot, getMoodCategory } from "@/app/lib/slots";

const prisma = new PrismaClient();

// Valid mood types
const VALID_MOODS = [
    "happy",
    "calm",
    "excited",
    "loved",
    "meh",
    "tired",
    "anxious",
    "frustrated",
    "sad",
    "angry",
];

// ─── Type definitions ────────────────────────────────────────────────────────

interface SaveMoodRequest {
    mood: string;
    note?: string;
}

interface SaveMoodResponse {
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Extracts and verifies the Firebase ID token from request headers
 */
async function verifyToken(request: NextRequest): Promise<string | null> {
    try {
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return null;
        }

        const token = authHeader.substring(7);
        const decodedToken = await adminAuth.verifyIdToken(token);
        return decodedToken.uid;
    } catch (error) {
        console.error("Token verification failed:", error);
        return null;
    }
}

// ─── POST Handler ───────────────────────────────────────────────────────────

export async function POST(
    request: NextRequest
): Promise<NextResponse<SaveMoodResponse>> {
    try {
        // Verify authentication
        const userId = await verifyToken(request);
        if (!userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Parse request body
        const body: SaveMoodRequest = await request.json();
        const { mood, note = "" } = body;

        // Validate mood
        if (!mood || !VALID_MOODS.includes(mood)) {
            return NextResponse.json(
                { success: false, error: "Invalid mood type" },
                { status: 400 }
            );
        }

        // Validate note
        const trimmedNote = note?.trim() ?? "";
        if (trimmedNote.length > 280) {
            return NextResponse.json(
                { success: false, error: "Note exceeds 280 characters" },
                { status: 400 }
            );
        }

        // Determine current slot and category
        const slot = getCurrentSlot();
        const category = getMoodCategory(mood);

        // Save to database
        const moodLog = await prisma.moodLog.create({
            data: {
                userId,
                mood: mood as MoodType,
                category: category as MoodCategory,
                slot: slot as DaySlot,
                note: trimmedNote || null,
            },
        });

        // Return success response
        return NextResponse.json(
            {
                success: true,
                data: {
                    id: moodLog.id,
                    userId: moodLog.userId,
                    mood: moodLog.mood,
                    note: moodLog.note,
                    slot: moodLog.slot,
                    category: moodLog.category,
                    createdAt: moodLog.createdAt.toISOString(),
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error saving mood:", error);
        return NextResponse.json(
            { success: false, error: "Failed to save mood" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// ─── OPTIONS Handler (for CORS) ──────────────────────────────────────────────

export async function OPTIONS() {
    return NextResponse.json({}, { status: 200 });
}
