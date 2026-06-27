"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

import { Illustration } from "@/components/illustrations";
import { Button } from "@/components/ui/button";

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
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 p-8 text-center">
      <Illustration name="error" size="lg" />
      <div className="space-y-1.5">
        <h1 className="text-h2">Something went wrong</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          An unexpected error occurred. You can try again — if it persists,
          please refresh the page.
        </p>
      </div>
      <Button onClick={reset}>
        <RotateCcw className="mr-2 h-4 w-4" />
        Try again
      </Button>
    </div>
  );
}
