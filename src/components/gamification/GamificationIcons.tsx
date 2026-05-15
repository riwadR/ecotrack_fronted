type IconProps = {
  size?: number;
  color?: string;
};

export function PointsIcon({ size = 24, color = "#16a34a" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 3L14.8 8.6L21 9.3L16.5 13.4L17.8 19.5L12 16.6L6.2 19.5L7.5 13.4L3 9.3L9.2 8.6L12 3Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Co2Icon({ size = 24, color = "#15803d" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 18C4.8 16.2 4 13.7 4.8 11.2C5.6 8.7 7.9 7 10.5 7C11.4 4.8 13.6 3 16.2 3C19.6 3 22.3 5.7 22.3 9.1C22.3 9.5 22.3 9.9 22.2 10.3"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M3 20H21"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M8 20C8 16.7 10.7 14 14 14"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function TrophyIcon({ size = 24, color = "#16a34a" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 4H17V8C17 10.8 14.8 13 12 13C9.2 13 7 10.8 7 8V4Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M5 6H7M17 6H19C19 8.2 17.2 10 15 10M5 6C5 8.2 6.8 10 9 10"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 13V16M9 20H15L14 16H10L9 20Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LeafIcon({ size = 24, color = "#16a34a" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 4C14 4 9 7 6 12C9 17 14 20 20 20C20 14 20 9 20 4Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M6 12C10 12 14 8 20 4"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SparkleIcon({ size = 24, color = "#16a34a" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 3L13.2 8.4L18 9.6L13.2 10.8L12 16.2L10.8 10.8L6 9.6L10.8 8.4L12 3Z"
        fill={color}
        opacity="0.9"
      />
      <path
        d="M19 14L19.8 17.2L23 18L19.8 18.8L19 22L18.2 18.8L15 18L18.2 17.2L19 14Z"
        fill={color}
        opacity="0.55"
      />
      <path
        d="M5 15L5.6 17.4L8 18L5.6 18.6L5 21L4.4 18.6L2 18L4.4 17.4L5 15Z"
        fill={color}
        opacity="0.55"
      />
    </svg>
  );
}

type MedalVariant = "gold" | "silver" | "bronze";

const medalColors: Record<MedalVariant, { fill: string; ribbon: string }> = {
  gold: { fill: "#fbbf24", ribbon: "#f59e0b" },
  silver: { fill: "#cbd5e1", ribbon: "#94a3b8" },
  bronze: { fill: "#fdba74", ribbon: "#d97706" },
};

export function MedalIcon({
  size = 24,
  variant = "gold",
}: IconProps & { variant?: MedalVariant }) {
  const colors = medalColors[variant];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8.5 4L10.5 9H6.5L8.5 4ZM15.5 4L17.5 9H13.5L15.5 4Z"
        fill={colors.ribbon}
      />
      <circle cx="12" cy="14" r="5.5" fill={colors.fill} stroke={colors.ribbon} strokeWidth="1.2" />
      <circle cx="12" cy="14" r="3.2" fill="rgba(255,255,255,0.35)" />
    </svg>
  );
}
