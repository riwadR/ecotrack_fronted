import { gamificationTheme } from "@/components/gamification/gamificationTheme";

type SkeletonBlockProps = {
  width?: string;
  height?: string;
  borderRadius?: string;
};

function SkeletonBlock({
  width = "100%",
  height = "16px",
  borderRadius = gamificationTheme.radiusSm,
}: SkeletonBlockProps) {
  return (
    <div
      className="gamification-skeleton"
      style={{
        width,
        height,
        borderRadius,
        background:
          "linear-gradient(90deg, #e2e8f0 0%, #f8fafc 50%, #e2e8f0 100%)",
        backgroundSize: "200% 100%",
        animation: "gamification-shimmer 1.2s ease-in-out infinite",
      }}
    />
  );
}

function SkeletonCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: gamificationTheme.cardBackground,
        borderRadius: gamificationTheme.radiusMd,
        padding: "20px",
        boxShadow: gamificationTheme.shadow,
        border: `1px solid ${gamificationTheme.border}`,
        display: "grid",
        gap: "12px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function EcologicalImpactStatsSkeleton() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "16px",
      }}
    >
      {Array.from({ length: 2 }).map((_, index) => (
        <SkeletonCard key={index}>
          <SkeletonBlock width="48px" height="48px" borderRadius="12px" />
          <SkeletonBlock width="60%" height="28px" />
          <SkeletonBlock width="80%" height="14px" />
        </SkeletonCard>
      ))}
    </div>
  );
}

export function BadgeProgressSkeleton() {
  return (
    <SkeletonCard>
      <SkeletonBlock width="40%" height="18px" />
      <SkeletonBlock width="70%" height="14px" />
      <SkeletonBlock width="100%" height="12px" borderRadius="999px" />
    </SkeletonCard>
  );
}

export function BadgeGridSkeleton() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        gap: "16px",
      }}
    >
      {Array.from({ length: 8 }).map((_, index) => (
        <SkeletonCard key={index} style={{ justifyItems: "center" }}>
          <SkeletonBlock width="64px" height="64px" borderRadius="16px" />
          <SkeletonBlock width="80%" height="14px" />
          <SkeletonBlock width="100%" height="12px" />
        </SkeletonCard>
      ))}
    </div>
  );
}

export function MyBadgesSkeleton() {
  return (
    <SkeletonCard>
      <SkeletonBlock width="35%" height="18px" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: "16px",
        }}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonBlock key={index} width="64px" height="64px" borderRadius="16px" />
        ))}
      </div>
    </SkeletonCard>
  );
}

export function LeaderboardSkeleton() {
  return (
    <SkeletonCard>
      <SkeletonBlock width="45%" height="18px" />
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          style={{
            display: "grid",
            gridTemplateColumns: "40px 1fr 80px",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <SkeletonBlock width="32px" height="32px" borderRadius="999px" />
          <SkeletonBlock width="70%" height="14px" />
          <SkeletonBlock width="100%" height="14px" />
        </div>
      ))}
    </SkeletonCard>
  );
}
