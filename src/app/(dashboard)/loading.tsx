import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-fadeIn select-none">
      {/* Header Skeleton */}
      <div className="space-y-3 pb-6 border-b border-border/60">
        <div className="flex items-center space-x-2">
          <Skeleton className="w-24 h-6 rounded-full" />
          <Skeleton className="w-32 h-6 rounded-full" />
        </div>
        <Skeleton className="w-64 sm:w-96 h-10 rounded-2xl" />
        <Skeleton className="w-full max-w-xl h-4 rounded-xl" />
      </div>

      {/* Action / Filter Skeleton */}
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="w-20 h-9 rounded-full" />
        <Skeleton className="w-28 h-9 rounded-full" />
        <Skeleton className="w-24 h-9 rounded-full" />
        <Skeleton className="w-32 h-9 rounded-full" />
      </div>

      {/* Card Grid Skeleton (3 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            className="rounded-3xl border-2 border-border/80 bg-surface/60 p-6 space-y-4 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="w-20 h-6 rounded-full" />
              <Skeleton className="w-16 h-4 rounded-xl" />
            </div>

            <div className="space-y-2">
              <Skeleton className="w-4/5 h-6 rounded-xl" />
              <Skeleton className="w-full h-4 rounded-xl" />
              <Skeleton className="w-2/3 h-4 rounded-xl" />
            </div>

            <div className="pt-4 border-t border-border/40 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Skeleton className="w-7 h-7 rounded-full" />
                <Skeleton className="w-24 h-4 rounded-xl" />
              </div>
              <Skeleton className="w-20 h-9 rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

