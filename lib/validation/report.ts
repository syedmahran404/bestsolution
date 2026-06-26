import { z } from "zod";

/**
 * Validation schema for creating a citizen report (Phase 2).
 *
 * Shared by the client form (react-hook-form via @hookform/resolvers) AND the
 * server Route Handler, so the same rules are enforced in both places — no
 * drift between client and server validation.
 */

/** Category values kept in sync with the IssueCategory type. */
export const REPORT_CATEGORIES = [
  "pothole",
  "water_leak",
  "garbage",
  "streetlight",
  "drainage",
  "other",
] as const;

export const createReportSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title must be 120 characters or fewer"),
  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters")
    .max(1000, "Description must be 1000 characters or fewer"),
  category: z.enum(REPORT_CATEGORIES, {
    errorMap: () => ({ message: "Select a valid category" }),
  }),
  latitude: z
    .number({ invalid_type_error: "Latitude is required" })
    .min(-90, "Invalid latitude")
    .max(90, "Invalid latitude"),
  longitude: z
    .number({ invalid_type_error: "Longitude is required" })
    .min(-180, "Invalid longitude")
    .max(180, "Invalid longitude"),
  imageUrl: z.string().url("Invalid image URL").nullable().optional(),
  audioUrl: z.string().url("Invalid audio URL").nullable().optional(),
  /** Anonymous reporter id (U1). Optional for backward compatibility. */
  reporterId: z.string().trim().min(1).max(64).nullable().optional(),
  /** Optional display name for identified reporting (U1). */
  reporterName: z.string().trim().max(80).nullable().optional(),
});

/** Server-side input (after media has been uploaded to Storage). */
export type CreateReportInput = z.infer<typeof createReportSchema>;

/**
 * Client form values. Title/description/category/coords are validated by the
 * form; media files are handled as separate React state and uploaded to
 * Storage before the validated payload is sent to the API.
 */
export const reportFormSchema = createReportSchema.pick({
  title: true,
  description: true,
  category: true,
  latitude: true,
  longitude: true,
});

export type ReportFormValues = z.infer<typeof reportFormSchema>;
