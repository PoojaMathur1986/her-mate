// ═══════════════════════════════════════════════════════════════════════════
// Server-side Firebase Admin Initialization
// Used for verifying ID tokens on the server
// ═══════════════════════════════════════════════════════════════════════════

import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
    const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    };

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
}

export const adminAuth = admin.auth();
export const adminApp = admin.app();
