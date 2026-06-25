import { Skeleton } from "@/components/ui/skeleton";

/**
 * Root route loading state. Shown automatically by Next.js while async server
 * components (map, civic cases, dashboards) fetch data.
 */
export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="h-16 border-b" />
      <main className="container flex-1 space-y-5 py-6">
        <Skeleton className="h-8 w-72" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-[58vh] min-h-[440px] w-full rounded-xl" />
      </main>
    </div>
  );
}
