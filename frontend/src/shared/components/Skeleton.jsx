// Shimmering placeholder blocks for loading states. Compose these to match
// the actual shape of the content that's loading, instead of a generic
// spinner - it reduces perceived load time and avoids layout jump.
function SkeletonBlock({ className = "" }) {
  return (
    <div
      className={`relative overflow-hidden bg-base-800 rounded-lg ${className}`}
    >
      <div
        className="absolute inset-0 -translate-x-full animate-shimmer"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
          backgroundSize: "400px 100%",
        }}
      />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="card p-4 flex items-center gap-3.5">
      <SkeletonBlock className="w-10 h-10 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonBlock className="h-5 w-12" />
        <SkeletonBlock className="h-3 w-20" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <SkeletonBlock className="h-5 w-40 mb-4" />
          <SkeletonBlock className="h-56 w-full" />
        </div>
        <div className="card p-5 space-y-3">
          <SkeletonBlock className="h-5 w-24 mb-2" />
          <SkeletonBlock className="h-14 w-full" />
          <SkeletonBlock className="h-14 w-full" />
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-2.5">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="p-3.5 rounded-xl bg-base-800 border border-base-700 space-y-2">
          <SkeletonBlock className="h-4 w-1/2" />
          <SkeletonBlock className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}

export default SkeletonBlock;
