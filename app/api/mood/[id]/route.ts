// ═══════════════════════════════════════════════════════════════════════════
// API Route: Update Mood Note
// PATCH /api/mood/:id
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/app/lib/firebaseAdmin";
import { prisma } from "@/app/lib/prisma";

interface UpdateMoodRequest {
    note: string;
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

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<UpdateMoodResponse>> {
    try {
        const { id: moodId } = await params;

        // Verify authentication
        const userId = await verifyToken(request);
        if (!userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Parse request body
        const body: UpdateMoodRequest = await request.json();
        const { note = "" } = body;

        // Validate note
        const trimmedNote = note?.trim() ?? "";
        if (trimmedNote.length > 280) {
            return NextResponse.json(
                { success: false, error: "Note exceeds 280 characters" },
                { status: 400 }
            );
        }

        // Verify mood exists and belongs to user
        const existingMood = await prisma.moodLog.findUnique({
            where: { id: moodId },
        });

        if (!existingMood) {
            return NextResponse.json(
                { success: false, error: "Mood not found" },
                { status: 404 }
            );
        }

        if (existingMood.userId !== userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 403 }
            );
        }

        // Update mood note
        const updatedMood = await prisma.moodLog.update({
            where: { id: moodId },
            data: {
                note: trimmedNote || null,
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: {
                    id: updatedMood.id,
                    mood: updatedMood.mood,
                    note: updatedMood.note,
                    slot: updatedMood.slot,
                    category: updatedMood.category,
                    updatedAt: updatedMood.updatedAt.toISOString(),
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating mood:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update mood" },
            { status: 500 }
        );
    }
}

export async function OPTIONS() {
    return NextResponse.json({}, { status: 200 });
}
