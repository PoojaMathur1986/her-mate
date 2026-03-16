# Prisma Setup Guide — Mood Logging

Simplified Prisma 7.5 schema for mood logging in Her-Mate, designed to start simple and expand as needed.

## Schema Design Decisions

### Why This Schema?

**MoodLog** — Core table for recording mood check-ins

- Simple, lightweight structure focused on mood data collection
- `userId` stored as plain string (Firebase Auth UID) — no enforced relation yet
- Tracks mood type, category, time-of-day, and optional note
- Designed to be added to the app quickly without waiting for full user model

**MoodType** — 10 mood options covering common emotional states

- happy, calm, excited, loved, meh, tired, anxious, frustrated, sad, angry
- Matches the moods available on the mood logging page

**MoodCategory** — Mood categorization for analytics

- positive: happy, calm, excited, loved
- neutral: meh
- challenging: tired, anxious, frustrated, sad, angry
- Enables filtering and analysis by mood family

**DaySlot** — Time-of-day tracking for mood patterns

- morning (05:00–11:59)
- afternoon (12:00–16:59)
- evening (17:00–20:59)
- night (21:00–04:59)
- Captures when moods occur throughout the day for insights

**Immutable logs** — Mood entries cannot be deleted once logged, ensuring data integrity

**Minimal indexes** — Only essential indexes for common queries

- By userId: fetch user's logs
- By mood: filter/analytics by mood type
- By timestamp: chronological queries

### Future Additions

When ready, you can extend with:

- `User` model with full profile & timezone support
- `MoodStreak` for consistency tracking
- `MoodTag` for custom categorization
- Analytics/aggregation tables

## Installation & Setup

### 1. Install Dependencies

```bash
npm install @prisma/client prisma
```

### 2. Configure Environment

Copy `.env.example` to `.env` and add your PostgreSQL URL:

```bash
cp .env.example .env
```

Edit `.env`:

```
DATABASE_URL=postgresql://user:password@localhost:5432/her-mate
```

### 3. Prisma 7.5 Configuration

Prisma 7.5 requires connection URLs to be in `prisma.config.ts` at the project root (not in the prisma directory).

The config file is already created at [prisma.config.ts](prisma.config.ts):

```typescript
import { defineConfig } from "@prisma/internals";

export default defineConfig({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
```

This reads the `DATABASE_URL` environment variable for migrations and database operations.

### 4. Create Database Migrations

```bash
npx prisma migrate dev --name init
```

This will:

- Create tables in PostgreSQL
- Generate Prisma Client for type-safe queries
- Track migration history

### 5. Verify Setup

```bash
npx prisma studio
```

Opens a GUI to view and manage your database.

## Basic Usage

### Import Prisma Client

Create `lib/prisma.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

### Create a Mood Log

```typescript
import { prisma } from "@/lib/prisma";

const moodLog = await prisma.moodLog.create({
  data: {
    userId: "firebase-user-uid", // from Firebase Auth
    mood: "happy",
    category: "positive",
    slot: "afternoon",
    note: "Great day with friends!",
  },
});
```

### Get User's Recent Moods

```typescript
const recentMoods = await prisma.moodLog.findMany({
  where: {
    userId: "firebase-user-uid",
  },
  orderBy: { createdAt: "desc" },
  take: 10,
});
```

### Get Mood Statistics

```typescript
const moodCounts = await prisma.moodLog.groupBy({
  by: ["mood"],
  where: {
    userId: "firebase-user-uid",
    createdAt: {
      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // last 30 days
    },
  },
  _count: true,
});
```

## Prisma 7.5 Configuration

### Schema Structure

In Prisma 7.5, the schema file no longer contains connection URLs. The datasource is minimal:

```prisma
datasource db {
  provider = "postgresql"
}
```

Connection URLs are managed in [prisma.config.ts](prisma.config.ts) at the project root, which reads from your environment variables.

The generator remains standard:

```prisma
generator client {
  provider = "prisma-client-js"
}
```

### Prisma CLI Commands

```bash
# Generate client after schema changes
npx prisma generate

# Create new migration
npx prisma migrate dev --name <migration_name>

# Deploy migrations to production
npx prisma migrate deploy

# Reset database (DEV ONLY)
npx prisma migrate reset

# View database GUI
npx prisma studio
```

## API Route Example

Create `app/api/mood/route.ts`:

```typescript
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, mood, category, slot, note } = body;

    const moodLog = await prisma.moodLog.create({
      data: { userId, mood, category, slot, note },
    });

    return NextResponse.json(moodLog, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create mood log" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const moods = await prisma.moodLog.findMany({
      where: {
        userId,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(moods);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch moods" },
      { status: 500 },
    );
  }
}
```

## Schema Evolution

### Adding User Model Later

When ready to implement full user profiles:

```prisma
model User {
  id        String    @id // Firebase UID
  email     String    @unique
  timezone  String    @default("UTC")
  moodLogs  MoodLog[]
  // ...
}

model MoodLog {
  // ... existing fields ...
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  // Keep userId but now with foreign key constraint
}
```

Then migrate:

```bash
npx prisma migrate dev --name add_user_model
```

### Other Extensions

**Mood Tags for custom categories:**

```prisma
model MoodTag {
  id      String   @id @default(uuid())
  userId  String
  name    String   // "work", "family", "health"
  moods   String[] // which mood logs have this tag
}
```

**Streak tracking:**

```prisma
model MoodStreak {
  userId          String    @id
  currentStreak   Int       @default(0)
  longestStreak   Int       @default(0)
  lastLoggedDate  DateTime?
}
```

## Troubleshooting

### "DatabaseError: connect ECONNREFUSED"

- Check PostgreSQL is running
- Verify DATABASE_URL in `.env`
- Ensure credentials are correct

### Type Errors with Prisma Client

```bash
# Regenerate types
npx prisma generate
```

### Migration Conflicts

```bash
# Reset (dev only) and start fresh
npx prisma migrate reset
```

## Best Practices

✅ **Do:**

- Use the singleton pattern for PrismaClient (prevents connection exhaustion)
- Handle Prisma errors in try-catch blocks
- Use `.findUnique()` when querying by unique fields
- Ensure users understand mood logs are immutable once created

❌ **Don't:**

- Create multiple PrismaClient instances in same app
- Forget to call `prisma.$disconnect()` for one-off scripts
- Leave migrations uncommitted to git
- Assume schema changes are backward compatible
