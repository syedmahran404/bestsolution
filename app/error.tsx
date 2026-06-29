"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

import { Illustration } from "@/components/illustrations";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/provider";

/**
 * Global error boundary (App Router). Prevents the app from crashing to a
 * blank screen and offers a recovery action.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useT();
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 p-8 text-center">
      <Illustration name="error" size="lg" />
      <div className="space-y-1.5">
        <h1 className="text-h2">{t("error.title")}</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          {t("error.body")}
        </p>
      </div>
      <Button onClick={reset}>
        <RotateCcw className="mr-2 h-4 w-4" />
        {t("common.retry")}
      </Button>
    </div>
  );
}
