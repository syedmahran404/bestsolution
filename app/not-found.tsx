import Link from "next/link";

import { Illustration } from "@/components/illustrations";
import { Button } from "@/components/ui/button";

/** Custom 404 (also used when a civic case id is not found). */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 p-8 text-center">
      <Illustration name="search" size="lg" />
      <div className="space-y-1.5">
        <h1 className="text-h2">Page not found</h1>
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
