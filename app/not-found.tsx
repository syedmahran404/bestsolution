import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Custom 404 (also used when a civic case id is not found). */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Compass className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Page not found</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          The page or civic case you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Back to map</Link>
      </Button>
    </div>
  );
}
