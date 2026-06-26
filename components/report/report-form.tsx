"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AlertCircle, Loader2, Send, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageField } from "@/components/report/image-field";
import { LocationField } from "@/components/report/location-field";
import { VoiceRecorderField } from "@/components/report/voice-recorder-field";
import { CATEGORY_META } from "@/lib/constants";
import { isFirebaseClientConfigured } from "@/lib/firebase/client";
import { guessExtension, uploadToStorage } from "@/lib/firebase/upload";
import {
  getReporterId,
  getReporterName,
  setReporterName,
} from "@/lib/reporter";
import {
  REPORT_CATEGORIES,
  reportFormSchema,
  type ReportFormValues,
} from "@/lib/validation/report";

export function ReportForm() {
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [identified, setIdentified] = useState(false);
  const [name, setName] = useState("");

  // Load any saved display name (client-only; localStorage).
  useEffect(() => {
    const saved = getReporterName();
    if (saved) {
      setName(saved);
      setIdentified(true);
    }
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "pothole",
      latitude: undefined,
      longitude: undefined,
    },
  });

  const latitude = watch("latitude");
  const longitude = watch("longitude");

  async function onSubmit(values: ReportFormValues) {
    setSubmitError(null);
    try {
      let imageUrl: string | null = null;
      let audioUrl: string | null = null;

      if (imageFile) {
        imageUrl = await uploadToStorage(
          imageFile,
          "reports/images",
          guessExtension(imageFile, "jpg"),
        );
      }
      if (audioBlob) {
        audioUrl = await uploadToStorage(
          audioBlob,
          "reports/audio",
          guessExtension(audioBlob, "webm"),
        );
      }

      const trimmedName = identified ? name.trim() : "";
      setReporterName(trimmedName);

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          imageUrl,
          audioUrl,
          reporterId: getReporterId(),
          reporterName: trimmedName || null,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error ?? "Failed to submit report.");
      }

      router.push("/reports?submitted=1");
      router.refresh();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {!isFirebaseClientConfigured && (
        <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Firebase is not configured yet. Set the{" "}
            <code>NEXT_PUBLIC_FIREBASE_*</code> environment variables to enable
            media uploads and submission.
          </p>
        </div>
      )}

      {/* Reporter identity (U1): anonymous by default, optional name */}
      <div className="space-y-2 rounded-md border bg-muted/30 p-3">
        <div className="flex items-center gap-1.5">
          <UserRound className="h-4 w-4 text-muted-foreground" />
          <Label>Reporting as</Label>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={identified ? "outline" : "default"}
            onClick={() => setIdentified(false)}
          >
            Anonymous
          </Button>
          <Button
            type="button"
            size="sm"
            variant={identified ? "default" : "outline"}
            onClick={() => setIdentified(true)}
          >
            Add my name
          </Button>
        </div>
        {identified && (
          <Input
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
          />
        )}
        <p className="text-xs text-muted-foreground">
          Anonymous reports never collect personal data. Either way, you can
          track your reports on this device.
        </p>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">Issue title</Label>
        <Input
          id="title"
          placeholder="e.g. Large pothole near the bus stop"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          {...register("category")}
        >
          {REPORT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_META[c].glyph} {CATEGORY_META[c].label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-xs text-destructive">{errors.category.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={4}
          placeholder="Describe the issue, when you noticed it, and any safety concerns."
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Photo */}
      <ImageField onImageChange={setImageFile} />

      {/* Voice */}
      <VoiceRecorderField onAudioChange={setAudioBlob} />

      {/* Location */}
      <LocationField
        latitude={latitude ?? null}
        longitude={longitude ?? null}
        onChange={(lat, lng) => {
          setValue("latitude", lat ?? (undefined as unknown as number), {
            shouldValidate: true,
          });
          setValue("longitude", lng ?? (undefined as unknown as number), {
            shouldValidate: true,
          });
        }}
        error={
          errors.latitude?.message ?? errors.longitude?.message ?? undefined
        }
      />

      {submitError && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{submitError}</p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting report…
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Submit report
          </>
        )}
      </Button>
    </form>
  );
}
