import { cn } from "@/lib/utils";

/** Subtle shimmer placeholder used by route-level loading states. */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("shimmer animate-shimmer rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
