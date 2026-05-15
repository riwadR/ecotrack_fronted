function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`gamification-skeleton ${className}`} />;
}

export function ChallengeCardSkeleton() {
  return (
    <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <SkeletonBlock className="h-5 w-3/4 rounded-md" />
      <SkeletonBlock className="h-4 w-full rounded-md" />
      <SkeletonBlock className="h-6 w-28 rounded-full" />
      <SkeletonBlock className="h-3 w-full rounded-full" />
      <SkeletonBlock className="h-10 w-full rounded-lg" />
    </div>
  );
}

export function ChallengeGallerySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <ChallengeCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function ChallengeAdminTableSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[1.5fr_1fr_1.2fr_0.8fr_0.7fr] gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <SkeletonBlock className="h-4 w-4/5 rounded-md" />
          <SkeletonBlock className="h-4 w-2/3 rounded-md" />
          <SkeletonBlock className="h-4 w-full rounded-md" />
          <SkeletonBlock className="h-4 w-16 rounded-md" />
          <SkeletonBlock className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}
