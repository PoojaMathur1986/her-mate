// ═══════════════════════════════════════════════════════════════════════════
// API Route: Check Mood for Current Slot
// GET /api/mood/check
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/app/lib/firebaseAdmin";
import { getCurrentSlot } from "@/app/lib/slots";
import { prisma } from "@/app/lib/prisma";
import { DaySlot } from "@prisma/client";

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

export async function GET(
    request: NextRequest
): Promise<NextResponse<CheckMoodResponse>> {
    try {
        // Verify authentication
        const userId = await verifyToken(request);
        if (!userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get current slot
        const currentSlot = getCurrentSlot();

        // Check if mood already exists for this slot today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingMood = await prisma.moodLog.findFirst({
            where: {
                userId,
                slot: currentSlot as DaySlot,
                createdAt: {
                    gte: today,
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        if (existingMood) {
            return NextResponse.json(
                {
                    success: true,
                    data: {
                        id: existingMood.id,
                        exists: true,
                        mood: existingMood.mood,
                        note: existingMood.note,
                        slot: existingMood.slot,
                        createdAt: existingMood.createdAt.toISOString(),
                    },
                },
                { status: 200 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: {
                    exists: false,
                    slot: currentSlot,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error checking mood:", error);
        return NextResponse.json(
            { success: false, error: "Failed to check mood" },
            { status: 500 }
        );
    }
}

export async function OPTIONS() {
    return NextResponse.json({}, { status: 200 });
}
