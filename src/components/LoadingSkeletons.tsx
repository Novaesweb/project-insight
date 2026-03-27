export function SkeletonKPI() {
  return (
    <div className="glass-card rounded-xl p-5 border-[0.5px] border-white/[0.08]">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="skeleton-shimmer h-3 w-20 rounded" />
          <div className="skeleton-shimmer h-7 w-16 rounded" />
        </div>
        <div className="skeleton-shimmer w-10 h-10 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="glass-card rounded-xl border-[0.5px] border-white/[0.08] overflow-hidden">
      <div className="p-4 border-b border-white/[0.06]">
        <div className="skeleton-shimmer h-4 w-32 rounded" />
      </div>
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex gap-4">
          <div className="skeleton-shimmer h-3 w-24 rounded" />
          <div className="skeleton-shimmer h-3 w-16 rounded" />
          <div className="skeleton-shimmer h-3 w-20 rounded" />
          <div className="skeleton-shimmer h-3 w-16 rounded" />
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 py-2">
            <div className="skeleton-shimmer h-4 w-28 rounded" />
            <div className="skeleton-shimmer h-4 w-14 rounded" />
            <div className="skeleton-shimmer h-4 w-20 rounded" />
            <div className="skeleton-shimmer h-4 w-16 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-card rounded-xl p-4 border-[0.5px] border-white/[0.08] space-y-3">
      <div className="skeleton-shimmer h-24 w-full rounded-lg" />
      <div className="skeleton-shimmer h-4 w-3/4 rounded" />
      <div className="skeleton-shimmer h-3 w-1/2 rounded" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <SkeletonKPI key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SkeletonTable rows={5} />
        <SkeletonTable rows={5} />
      </div>
    </div>
  );
}



