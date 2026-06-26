import { z } from "zod";

/**
 * Validation schema for creating a citizen report.
 *
 * Shared by the client form (react-hook-form) AND the server Route Handler.
 *
 * V2.1 reporting UX:
 *  - category is the only always-required field.
 *  - title is optional and only REQUIRED when category === "other"
 *    (an explicit "issue name"); otherwise it is derived from the category.
 *  - description is optional ("additional details").
 *  - reporter contact (name/phone/email) is optional (verified mode).
 */

export const REPORT_CATEGORIES = [
  "pothole",
  "water_leak",
  "garbage",
  "streetlight",
  "drainage",
  "other",
] as const;

/** Base object (no refinements) so it can be `.pick`-ed for the form schema. */
const reportBaseSchema = z.object({
  title: z
    .string()
    .trim()
    .max(120, "Title must be 120 characters or fewer")
    .optional(),
  description: z
    .string()
    .trim()
    .max(1000, "Description must be 1000 characters or fewer")
    .optional(),
  category: z.enum(REPORT_CATEGORIES, {
    errorMap: () => ({ message: "Select a valid category" }),
  }),
  latitude: z
    .number({ invalid_type_error: "Pick a location" })
    .min(-90, "Invalid latitude")
    .max(90, "Invalid latitude"),
  longitude: z
    .number({ invalid_type_error: "Pick a location" })
    .min(-180, "Invalid longitude")
    .max(180, "Invalid longitude"),
  imageUrl: z.string().url("Invalid image URL").nullable().optional(),
  audioUrl: z.string().url("Invalid audio URL").nullable().optional(),
  reporterId: z.string().trim().min(1).max(64).nullable().optional(),
  reporterName: z.string().trim().max(80).nullable().optional(),
  reporterPhone: z.string().trim().max(20).nullable().optional(),
  reporterEmail: z
    .string()
    .trim()
    .max(120)
    .nullable()
    .optional()
    .refine(
      (v) => !v || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v),
      "Enter a valid email",
    ),
});

/** "Other" requires an explicit issue name (title). */
function requireTitleForOther(
  val: { category: string; title?: string },
  ctx: z.RefinementCtx,
) {
  if (val.category === "other" && (!val.title || val.title.trim().length < 3)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["title"],
      message: "Issue name is required for 'Other' (min 3 characters)",
    });
  }
}

export const createReportSchema =
  reportBaseSchema.superRefine(requireTitleForOther);

export type CreateReportInput = z.infer<typeof createReportSchema>;

/** Client form values (media + reporter contact handled outside RHF). */
export const reportFormSchema = reportBaseSchema
  .pick({
    title: true,
    description: true,
    category: true,
    latitude: true,
    longitude: true,
  })
  .superRefine(requireTitleForOther);

export type ReportFormValues = z.infer<typeof reportFormSchema>;
