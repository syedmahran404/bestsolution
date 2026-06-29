"use client";

import { useEffect, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useT } from "@/lib/i18n/provider";

interface ImageFieldProps {
  /** Called whenever the selected image changes (null when cleared). */
  onImageChange: (file: File | null) => void;
}

/** Photo upload field with a local preview. */
export function ImageField({ onImageChange }: ImageFieldProps) {
  const t = useT();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function setImage(file: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
    onImageChange(file);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <ImagePlus className="h-4 w-4 text-muted-foreground" />
        <Label>{t("report.photo")}</Label>
      </div>

      {previewUrl ? (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt={t("report.photoAlt")}
            className="h-24 w-24 rounded-md border object-cover"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setImage(null)}
            aria-label={t("report.removePhoto")}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground hover:bg-muted/50">
          <ImagePlus className="h-5 w-5" />
          <span>{t("report.uploadPhoto")}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setImage(file);
            }}
          />
        </label>
      )}
    </div>
  );
}
