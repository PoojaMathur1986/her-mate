/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { prisma } from "@/app/lib/prisma";

// Initialize Firebase Admin (will use existing instance if already initialized)
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

// ─── GET /api/journal ────────────────────────────────────────────────────────
// Fetch journal entries for a specific date
// Query params: date (YYYY-MM-DD format, optional - defaults to today)

export async function GET(req: NextRequest) {
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

        // Get date from query params or use today
        const urlParams = new URL(req.url).searchParams;
        const dateStr = urlParams.get("date");

        let targetDate: Date;
        if (dateStr) {
            targetDate = new Date(dateStr);
            if (isNaN(targetDate.getTime())) {
                return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 });
            }
        } else {
            targetDate = new Date();
        }

        // Convert to UTC date (YYYY-MM-DD)
        const dateKey = targetDate.toISOString().split("T")[0];
        const [year, month, day] = dateKey.split("-").map(Number);
        const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        const endDate = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0, 0));

        // Fetch entries for the user on this date (excluding soft-deleted)
        const entries = await prisma.journalEntry.findMany({
            where: {
                userId,
                date: {
                    gte: startDate,
                    lt: endDate,
                },
                isDeleted: false,
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        return NextResponse.json(
            {
                date: dateKey,
                entries: entries.map((e) => ({
                    id: e.id,
                    text: e.text,
                    emoji: e.emoji,
                    timestamp: e.createdAt,
                    createdAt: e.createdAt,
                    updatedAt: e.updatedAt,
                })),
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("GET /api/journal error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// ─── POST /api/journal ───────────────────────────────────────────────────────
// Create a new journal entry for today

export async function POST(req: NextRequest) {
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

        // Parse request body
        const body = await req.json();
        const { text, emoji = "✨" } = body;

        // Validate input
        if (!text || typeof text !== "string" || !text.trim()) {
            return NextResponse.json({ error: "Entry text is required" }, { status: 400 });
        }

        if (text.trim().length > 5000) {
            return NextResponse.json({ error: "Entry text must be 5000 characters or less" }, { status: 400 });
        }

        if (!emoji || typeof emoji !== "string") {
            return NextResponse.json({ error: "Invalid emoji" }, { status: 400 });
        }

        // Get today's date in UTC
        const today = new Date();
        const dateKey = today.toISOString().split("T")[0];
        const [year, month, day] = dateKey.split("-").map(Number);
        const dateForDb = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

        // Create entry
        const entry = await prisma.journalEntry.create({
            data: {
                userId,
                text: text.trim(),
                emoji,
                date: dateForDb,
            },
        });

        return NextResponse.json(
            {
                id: entry.id,
                text: entry.text,
                emoji: entry.emoji,
                timestamp: entry.createdAt,
                createdAt: entry.createdAt,
                updatedAt: entry.updatedAt,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST /api/journal error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
