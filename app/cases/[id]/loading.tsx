import { Skeleton } from "@/components/ui/skeleton";

/**
 * Case-detail route loading state. This screen awaits AI case intelligence and
 * the operations brief, so a layout-matched skeleton (instead of a blank
 * screen) keeps perceived performance high on navigation.
 */
export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="h-16 border-b" />
      <main className="container max-w-3xl flex-1 space-y-6 py-8">
        <Skeleton className="h-4 w-24" />

        {/* Case summary card */}
        <div className="space-y-4 rounded-xl border p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-5 w-40" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        </div>

        {/* AI / ops panels */}
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}

        {/* Map */}
        <Skeleton className="h-[40vh] min-h-[280px] w-full rounded-xl" />
      </main>
    </div>
  );
}
