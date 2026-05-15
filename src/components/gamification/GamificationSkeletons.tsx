function SkeletonBlock({
  className = "",
}: {
  className?: string;
}) {
  return <div className={`gamification-skeleton ${className}`} />;
}

function SkeletonCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`grid gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function EcologicalImpactStatsSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {Array.from({ length: 2 }).map((_, index) => (
        <SkeletonCard key={index} className="p-8">
          <SkeletonBlock className="h-12 w-12 rounded-xl" />
          <SkeletonBlock className="h-12 w-2/3 rounded-lg" />
          <SkeletonBlock className="h-4 w-1/2 rounded-md" />
        </SkeletonCard>
      ))}
    </div>
  );
}

export function BadgeProgressSkeleton() {
  return (
    <SkeletonCard className="p-8">
      <SkeletonBlock className="h-5 w-40 rounded-md" />
      <SkeletonBlock className="h-4 w-3/4 rounded-md" />
      <SkeletonBlock className="h-3 w-full rounded-full" />
    </SkeletonCard>
  );
}

export function BadgeGridSkeleton() {
  return (
    <div className="flex w-full flex-wrap justify-start gap-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <SkeletonCard key={index} className="w-[150px] p-5">
          <SkeletonBlock className="h-16 w-16 rounded-2xl" />
          <SkeletonBlock className="h-4 w-4/5 rounded-md" />
          <SkeletonBlock className="h-3 w-2/3 rounded-md" />
        </SkeletonCard>
      ))}
    </div>
  );
}

export function MyBadgesSkeleton() {
  return (
    <SkeletonCard className="p-8">
      <SkeletonBlock className="h-5 w-36 rounded-md" />
      <div className="flex flex-wrap justify-start gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-24 w-[120px] rounded-xl" />
        ))}
      </div>
    </SkeletonCard>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <SkeletonCard key={index} className="p-4">
          <div className="grid grid-cols-[40px_1fr_80px] items-center gap-4">
            <SkeletonBlock className="h-9 w-9 rounded-full" />
            <SkeletonBlock className="h-4 w-3/5 rounded-md" />
            <SkeletonBlock className="h-8 w-full rounded-md" />
          </div>
        </SkeletonCard>
      ))}
    </div>
  );
}
