/**
 * Firebase client SDK — browser/runtime singleton.
 *
 * Used by client components (e.g. real-time Firestore listeners in later
 * phases). All config comes from NEXT_PUBLIC_* env vars so it is safe to ship
 * to the browser. We guard against re-initialization during HMR / multiple
 * imports with getApps().
 */
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * True only when the minimum required public config is present. Lets the UI
 * degrade gracefully (and the build succeed) when env vars are not yet set.
 */
export const isFirebaseClientConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId,
);

let cachedApp: FirebaseApp | null = null;

function getClientApp(): FirebaseApp {
  if (!isFirebaseClientConfigured) {
    throw new Error(
      "Firebase client is not configured. Set NEXT_PUBLIC_FIREBASE_* env vars.",
    );
  }
  if (cachedApp) return cachedApp;
  cachedApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return cachedApp;
}

/** Firestore client instance (lazy). */
export function getDb(): Firestore {
  return getFirestore(getClientApp());
}

/** Firebase Storage client instance (lazy). */
export function getClientStorage(): FirebaseStorage {
  return getStorage(getClientApp());
}
