/**
 * Firebase Admin SDK — trusted server-only singleton.
 *
 * Used by API route handlers and scripts to read/write Firestore and Storage
 * with elevated privileges. NEVER import this from a client component.
 *
 * Credentials are provided via a base64-encoded service-account JSON in the
 * FIREBASE_SERVICE_ACCOUNT_KEY env var (the Vercel-friendly approach — a single
 * secret, no multiline parsing). The bucket name comes from
 * FIREBASE_STORAGE_BUCKET (falls back to the public bucket var).
 */
import "server-only";

import {
  cert,
  getApp,
  getApps,
  initializeApp,
  type App,
  type ServiceAccount,
} from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";

const APP_NAME = "velora-admin";

function loadServiceAccount(): ServiceAccount | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) return null;

  try {
    // Support both raw JSON and base64-encoded JSON.
    const json = raw.trim().startsWith("{")
      ? raw
      : Buffer.from(raw, "base64").toString("utf8");
    const parsed = JSON.parse(json);
    return {
      projectId: parsed.project_id ?? parsed.projectId,
      clientEmail: parsed.client_email ?? parsed.clientEmail,
      privateKey: (parsed.private_key ?? parsed.privateKey)?.replace(
        /\\n/g,
        "\n",
      ),
    };
  } catch (err) {
    console.error("[firebase/admin] Failed to parse service account:", err);
    return null;
  }
}

/** True when admin credentials are available. */
export const isFirebaseAdminConfigured = Boolean(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
);

let cachedApp: App | null = null;

function getAdminApp(): App {
  if (cachedApp) return cachedApp;

  const existing = getApps().find((a) => a.name === APP_NAME);
  if (existing) {
    cachedApp = existing;
    return cachedApp;
  }

  const serviceAccount = loadServiceAccount();
  if (!serviceAccount) {
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT_KEY.",
    );
  }

  cachedApp = initializeApp(
    {
      credential: cert(serviceAccount),
      storageBucket:
        process.env.FIREBASE_STORAGE_BUCKET ??
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    },
    APP_NAME,
  );
  return cachedApp;
}

/** Admin Firestore instance (lazy). */
export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}

/** Admin Storage instance (lazy). */
export function getAdminStorage(): Storage {
  return getStorage(getAdminApp());
}
