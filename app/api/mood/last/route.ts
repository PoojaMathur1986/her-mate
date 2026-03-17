// ═══════════════════════════════════════════════════════════════════════════
// API Route: Get Last Mood
// GET /api/mood/last
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/app/lib/firebaseAdmin";
import { prisma } from "@/app/lib/prisma";

interface LastMoodResponse {
    success: boolean;
    data?: {
        mood: string;
        note: string | null;
        slot: string;
        category: string;
        createdAt: string;
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
): Promise<NextResponse<LastMoodResponse>> {
    try {
        // Verify authentication
        const userId = await verifyToken(request);
        if (!userId) {
            console.warn("❌ Token verification failed");
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        console.log("✅ Token verified for userId:", userId);

        // Fetch the most recent mood log for this user
        const lastMood = await prisma.moodLog.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });

        if (!lastMood) {
            console.log("⚠️ No mood found for userId:", userId);
            return NextResponse.json(
                { success: false, error: "No mood data found" },
                { status: 404 }
            );
        }

        console.log("✅ Found mood:", lastMood);

        return NextResponse.json(
            {
                success: true,
                data: {
                    mood: lastMood.mood,
                    note: lastMood.note,
                    slot: lastMood.slot,
                    category: lastMood.category,
                    createdAt: lastMood.createdAt.toISOString(),
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("❌ Error fetching last mood:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch mood" },
            { status: 500 }
        );
    }
}

export async function OPTIONS() {
    return NextResponse.json({}, { status: 200 });
}
