"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Send, UserRound, ShieldCheck } from "lucide-react";

import { InfoBanner } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageField } from "@/components/report/image-field";
import { LocationPicker } from "@/components/report/location-picker";
import { VoiceRecorderField } from "@/components/report/voice-recorder-field";
import { CATEGORY_META } from "@/lib/constants";
import { isFirebaseClientConfigured } from "@/lib/firebase/client";
import { guessExtension, uploadToStorage } from "@/lib/firebase/upload";
import { getReporterId } from "@/lib/reporter";
import { useT } from "@/lib/i18n/provider";
import {
  REPORT_CATEGORIES,
  reportFormSchema,
  type ReportFormValues,
} from "@/lib/validation/report";
import type { IssueCategory } from "@/types";

const CATEGORY_HELP: Record<IssueCategory, string> = {
  pothole: "Road damage that risks vehicles or pedestrians.",
  water_leak: "Pipe bursts, leaks, or wastage on public land.",
  garbage: "Uncollected waste, dumping, or overflowing bins.",
  streetlight: "Non-working or damaged street lighting.",
  drainage: "Blocked drains, flooding, or open drains.",
  other: "Something else — give it a short name below.",
};

const DRAFT_KEY = "velora.report.draft";

export function ReportForm() {
  const router = useRouter();
  const t = useT();
  // Pre-split so the env-var token keeps its <code> styling while the
  // surrounding copy is fully localized via a single {code} placeholder key.
  const firebaseHintParts = t("report.firebaseHint").split("{code}");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Reporter identity (V2.1: anonymous | verified).
  const [verified, setVerified] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Location (address shown to user; coordinates lifted into the form).
  const [address, setAddress] = useState<string | null>(null);

  const restored = useRef(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
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

  const category = watch("category");
  const latitude = watch("latitude");
  const longitude = watch("longitude");

  // Restore an in-progress draft (text + reporter + location; not media).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        reset({
          title: d.title ?? "",
          description: d.description ?? "",
          category: d.category ?? "pothole",
          latitude: d.latitude ?? undefined,
          longitude: d.longitude ?? undefined,
        });
        if (d.verified) setVerified(true);
        if (d.name) setName(d.name);
        if (d.phone) setPhone(d.phone);
        if (d.email) setEmail(d.email);
        if (d.address) setAddress(d.address);
      }
    } catch {
      /* ignore */
    }
    restored.current = true;
  }, [reset]);

  // Auto-save the draft on change.
  useEffect(() => {
    if (!restored.current) return;
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          title: watch("title"),
          description: watch("description"),
          category,
          latitude,
          longitude,
          address,
          verified,
          name,
          phone,
          email,
        }),
      );
    } catch {
      /* ignore */
    }
  }, [
    category,
    latitude,
    longitude,
    address,
    verified,
    name,
    phone,
    email,
    watch,
  ]);

  async function onSubmit(values: ReportFormValues) {
    setSubmitError(null);
    if (verified && name.trim().length < 2) {
      setSubmitError("Please enter your name for verified reporting.");
      return;
    }
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

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          imageUrl,
          audioUrl,
          reporterId: getReporterId(),
          reporterName: verified ? name.trim() || null : null,
          reporterPhone: verified ? phone.trim() || null : null,
          reporterEmail: verified ? email.trim() || null : null,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        aggregation?: { reportCount?: number };
      };
      if (!res.ok) throw new Error(data.error ?? "Failed to submit report.");

      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      const count = data.aggregation?.reportCount ?? 1;
      router.push(`/reports?submitted=1&count=${count}`);
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
        <InfoBanner tone="warning" title={t("report.firebaseNotConfigured")}>
          {firebaseHintParts[0]}
          <code>NEXT_PUBLIC_FIREBASE_*</code>
          {firebaseHintParts[1]}
        </InfoBanner>
      )}

      {/* Category — the only always-required field */}
      <div className="space-y-1.5">
        <Label htmlFor="category">
          {t("report.category")} <span className="text-destructive">*</span>
        </Label>
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
        <p className="text-xs text-muted-foreground">
          {CATEGORY_HELP[category as IssueCategory]}
        </p>
      </div>

      {/* Title — only for "Other" */}
      {category === "other" && (
        <div className="space-y-1.5">
          <Label htmlFor="title">
            {t("report.issueName")} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            placeholder={t("report.titlePlaceholder")}
            {...register("title")}
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          )}
        </div>
      )}

      {/* Location */}
      <LocationPicker
        value={{
          latitude: latitude ?? null,
          longitude: longitude ?? null,
          address,
        }}
        onChange={(v) => {
          setValue("latitude", v.latitude ?? (undefined as unknown as number), {
            shouldValidate: true,
          });
          setValue(
            "longitude",
            v.longitude ?? (undefined as unknown as number),
            { shouldValidate: true },
          );
          setAddress(v.address);
        }}
        error={errors.latitude?.message ?? errors.longitude?.message}
      />

      {/* Photo */}
      <ImageField onImageChange={setImageFile} />

      {/* Voice */}
      <VoiceRecorderField onAudioChange={setAudioBlob} />

      {/* Additional details (optional) */}
      <div className="space-y-1.5">
        <Label htmlFor="description">{t("report.details")}</Label>
        <Textarea
          id="description"
          rows={3}
          placeholder={t("report.detailsPlaceholder")}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Reporter identity */}
      <div className="space-y-2 rounded-md border bg-muted/30 p-3">
        <div className="flex items-center gap-1.5">
          <UserRound className="h-4 w-4 text-muted-foreground" />
          <Label>{t("report.reportingAs")}</Label>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={verified ? "outline" : "default"}
            onClick={() => setVerified(false)}
          >
            {t("report.anonymous")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={verified ? "default" : "outline"}
            onClick={() => setVerified(true)}
          >
            <ShieldCheck className="mr-1.5 h-4 w-4" />
            {t("report.verified")}
          </Button>
        </div>
        {verified ? (
          <div className="space-y-2">
            <Input
              placeholder={`${t("report.name")} *`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
            />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Input
                placeholder={t("report.phone")}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={20}
              />
              <Input
                placeholder={t("report.email")}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={120}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {t("report.verifiedContactHint")}
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            {t("report.anonymousHint")}
          </p>
        )}
      </div>

      {submitError && (
        <InfoBanner tone="critical" title={t("report.submitErrorTitle")}>
          {submitError}
        </InfoBanner>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("report.submitting")}
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            {t("report.submit")}
          </>
        )}
      </Button>
    </form>
  );
}
