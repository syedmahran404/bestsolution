import { Skeleton } from "@/components/ui/skeleton";

/**
 * My Reports route loading state. Mirrors the impact banner and report cards
 * for a smooth navigation transition.
 */
export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="h-16 border-b" />
      <main className="container max-w-3xl flex-1 space-y-6 py-8">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>

        {/* Impact banner */}
        <Skeleton className="h-20 w-full rounded-xl" />

        {/* Report cards */}
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      </main>
    </div>
  );
}
