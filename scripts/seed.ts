/**
 * Firestore seeding script (Phase 1 deliverable, used from Phase 2 onward).
 *
 * Pushes the mock SEED_ISSUES dataset into the `issues` collection using the
 * Firebase Admin SDK. Safe to re-run: documents are written with their stable
 * seed ids (idempotent upsert via set({ merge: true })).
 *
 * This script initializes the Admin SDK INLINE (it does not import
 * lib/firebase/admin.ts, which is marked "server-only" for the Next.js app and
 * cannot be imported from a plain Node/tsx process).
 *
 * Usage:
 *   1. Set FIREBASE_SERVICE_ACCOUNT_KEY (+ FIREBASE_STORAGE_BUCKET) in .env.local
 *   2. npm run seed
 *
 * NOTE: Requires network + valid Firebase credentials, so run it locally or in
 * CI — not inside the restricted build sandbox.
 */
import { config as loadEnv } from "dotenv";
import {
  cert,
  getApps,
  initializeApp,
  type ServiceAccount,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import { COLLECTIONS } from "@/lib/constants";
import { SEED_ISSUES } from "@/lib/seed-data";

// Load .env.local then .env (later calls do not override already-set vars).
loadEnv({ path: ".env.local" });
loadEnv();

function loadServiceAccount(): ServiceAccount {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY is not set. Cannot seed Firestore.",
    );
  }
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
}

async function main() {
  const serviceAccount = loadServiceAccount();
  const app = getApps().length
    ? getApps()[0]
    : initializeApp({ credential: cert(serviceAccount) });

  const db = getFirestore(app);
  const batch = db.batch();

  for (const issue of SEED_ISSUES) {
    const ref = db.collection(COLLECTIONS.issues).doc(issue.id);
    batch.set(ref, issue, { merge: true });
  }

  await batch.commit();
  console.log(`✅ Seeded ${SEED_ISSUES.length} issues into Firestore.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  });
