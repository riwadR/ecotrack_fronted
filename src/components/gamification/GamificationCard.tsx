import type { CSSProperties, ReactNode } from "react";

type GamificationCardProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  animationDelayMs?: number;
  as?: "article" | "section";
  animate?: boolean;
};

export default function GamificationCard({
  children,
  className = "",
  style,
  animationDelayMs = 0,
  as = "article",
  animate = true,
}: GamificationCardProps) {
  const baseClassName = [
    "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300",
    "hover:-translate-y-0.5 hover:shadow-md",
    animate ? "gamification-fade-in" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const sharedProps = {
    className: baseClassName,
    style: { animationDelay: `${animationDelayMs}ms`, ...style },
  };

  if (as === "section") {
    return <section {...sharedProps}>{children}</section>;
  }

  return <article {...sharedProps}>{children}</article>;
}
