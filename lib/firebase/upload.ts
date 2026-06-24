"use client";

import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { getClientStorage } from "@/lib/firebase/client";

/**
 * Upload a file/blob to Firebase Storage from the browser and return its
 * public download URL.
 *
 * Used by the report form to store the photo and/or voice note before the
 * report metadata is persisted to Firestore via the API route. Uploading from
 * the client (rather than streaming large files through a serverless function)
 * is the standard, scalable Firebase pattern and avoids request-body limits.
 *
 * @param blob   The File or Blob to upload.
 * @param folder Logical folder within the bucket (e.g. "reports/images").
 * @param ext    File extension without the dot (e.g. "jpg", "webm").
 */
export async function uploadToStorage(
  blob: Blob,
  folder: string,
  ext: string,
): Promise<string> {
  const storage = getClientStorage();
  const filename = `${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}.${ext}`;
  const storageRef = ref(storage, filename);
  await uploadBytes(storageRef, blob, { contentType: blob.type || undefined });
  return getDownloadURL(storageRef);
}

/** Best-effort file-extension extractor from a filename or MIME type. */
export function guessExtension(file: File | Blob, fallback: string): string {
  if (file instanceof File && file.name.includes(".")) {
    return file.name.split(".").pop()!.toLowerCase();
  }
  const mime = file.type;
  if (mime) {
    const sub = mime.split("/")[1];
    if (sub) return sub.replace("x-", "").split(";")[0];
  }
  return fallback;
}
