"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Mic, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useT } from "@/lib/i18n/provider";

// Open-source recorder. Loaded client-side only (uses MediaRecorder / browser
// APIs that are unavailable during SSR).
const AudioRecorder = dynamic(
  () => import("react-audio-voice-recorder").then((m) => m.AudioRecorder),
  { ssr: false },
);

interface VoiceRecorderFieldProps {
  /** Called whenever the selected audio changes (null when cleared). */
  onAudioChange: (blob: Blob | null) => void;
}

/**
 * Voice reporting field. Citizens can either record a voice note (open-source
 * react-audio-voice-recorder) or upload an existing audio file. We do NOT
 * build a custom recorder (per Phase 2 spec).
 */
export function VoiceRecorderField({ onAudioChange }: VoiceRecorderFieldProps) {
  const t = useT();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Revoke object URLs on change/unmount to avoid memory leaks.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function setAudio(blob: Blob | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (blob) {
      setPreviewUrl(URL.createObjectURL(blob));
    } else {
      setPreviewUrl(null);
    }
    onAudioChange(blob);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Mic className="h-4 w-4 text-muted-foreground" />
        <Label>{t("report.voice")}</Label>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-md border bg-muted/30 p-3">
        <AudioRecorder
          onRecordingComplete={(blob: Blob) => setAudio(blob)}
          downloadOnSavePress={false}
          showVisualizer
        />

        <span className="text-xs text-muted-foreground">{t("common.or")}</span>

        <label className="cursor-pointer text-sm text-primary underline-offset-4 hover:underline">
          {t("report.uploadAudio")}
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setAudio(file);
            }}
          />
        </label>
      </div>

      {previewUrl && (
        <div className="flex items-center gap-3">
          <audio controls src={previewUrl} className="h-9 w-full max-w-xs" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setAudio(null)}
            aria-label={t("report.removeAudio")}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {previewUrl
          ? "Voice note attached. We'll transcribe it when the format is supported; otherwise your text is still analyzed — your report is never dropped."
          : "Speak in any language. If your browser records an unsupported format, the report still works from your text and photo."}
      </p>
    </div>
  );
}
