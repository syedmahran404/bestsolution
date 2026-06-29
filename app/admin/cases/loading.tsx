import { Skeleton } from "@/components/ui/skeleton";

/**
 * Case-management route loading state. Mirrors the header, filter bar, and
 * case list so navigation into the screen stays smooth.
 */
export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="h-16 border-b" />
      <main className="container flex-1 space-y-6 py-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-32" />
          ))}
        </div>

        {/* Case list */}
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      </main>
    </div>
  );
}
