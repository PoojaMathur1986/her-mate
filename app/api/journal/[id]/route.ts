/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { prisma } from "@/app/lib/prisma";

// Initialize Firebase Admin
try {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            }),
        });
    }
} catch (error) {
    console.error("Firebase initialization error:", error);
}

const adminAuth = admin.auth();

// Check if entry date is today
function isEntryToday(entryDate: Date): boolean {
    const today = new Date();
    const entryDateKey = entryDate.toISOString().split("T")[0];
    const todayDateKey = today.toISOString().split("T")[0];
    return entryDateKey === todayDateKey;
}

// ─── PATCH /api/journal/[id] ────────────────────────────────────────────────
// Update a journal entry (text or emoji)
// Only allows editing entries from today

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verify Firebase ID token
        const authHeader = req.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Missing or invalid authorization" }, { status: 401 });
        }

        const token = authHeader.substring(7);
        let decodedToken;
        try {
            decodedToken = await adminAuth.verifyIdToken(token);
        } catch (error) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
        }

        const userId = decodedToken.uid;
        const entryId = params.id;

        // Fetch entry
        const entry = await prisma.journalEntry.findUnique({
            where: { id: entryId },
        });

        if (!entry) {
            return NextResponse.json({ error: "Entry not found" }, { status: 404 });
        }

        // Verify ownership
        if (entry.userId !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Check if entry is soft-deleted
        if (entry.isDeleted) {
            return NextResponse.json({ error: "Entry has been deleted" }, { status: 410 });
        }

        // Check if entry is from today (only allow editing today's entries)
        if (!isEntryToday(entry.date)) {
            return NextResponse.json(
                { error: "Cannot edit entries from previous or future days" },
                { status: 403 }
            );
        }

        // Parse request body
        const body = await req.json();
        const { text, emoji } = body;

        const updateData: Record<string, unknown> = {};

        if (text !== undefined) {
            if (typeof text !== "string" || !text.trim()) {
                return NextResponse.json({ error: "Entry text is required" }, { status: 400 });
            }
            if (text.trim().length > 5000) {
                return NextResponse.json({ error: "Entry text must be 5000 characters or less" }, { status: 400 });
            }
            updateData.text = text.trim();
        }

        if (emoji !== undefined) {
            if (typeof emoji !== "string") {
                return NextResponse.json({ error: "Invalid emoji" }, { status: 400 });
            }
            updateData.emoji = emoji;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "No fields to update" }, { status: 400 });
        }

        // Update entry
        const updated = await prisma.journalEntry.update({
            where: { id: entryId },
            data: updateData,
        });

        return NextResponse.json(
            {
                id: updated.id,
                text: updated.text,
                emoji: updated.emoji,
                timestamp: updated.createdAt,
                createdAt: updated.createdAt,
                updatedAt: updated.updatedAt,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("PATCH /api/journal/[id] error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// ─── DELETE /api/journal/[id] ───────────────────────────────────────────────
// Soft-delete a journal entry (can delete any entry, not just today's)

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verify Firebase ID token
        const authHeader = req.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Missing or invalid authorization" }, { status: 401 });
        }

        const token = authHeader.substring(7);
        let decodedToken;
        try {
            decodedToken = await adminAuth.verifyIdToken(token);
        } catch (error) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
        }

        const userId = decodedToken.uid;
        const entryId = params.id;

        // Fetch entry
        const entry = await prisma.journalEntry.findUnique({
            where: { id: entryId },
        });

        if (!entry) {
            return NextResponse.json({ error: "Entry not found" }, { status: 404 });
        }

        // Verify ownership
        if (entry.userId !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Check if already deleted
        if (entry.isDeleted) {
            return NextResponse.json({ error: "Entry already deleted" }, { status: 410 });
        }

        // Soft delete
        await prisma.journalEntry.update({
            where: { id: entryId },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("DELETE /api/journal/[id] error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
