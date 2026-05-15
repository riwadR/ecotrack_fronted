import type { CSSProperties, ReactNode } from "react";
import { gamificationTheme } from "@/components/gamification/gamificationTheme";

type BadgeTooltipProps = {
  description: string;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
};

export default function BadgeTooltip({
  description,
  children,
  style,
  className = "",
}: BadgeTooltipProps) {
  const trimmed = description.trim();
  const hostClassName = ["badge-tooltip-host", className].filter(Boolean).join(" ");

  return (
    <div
      className={hostClassName}
      style={style}
      tabIndex={trimmed ? 0 : undefined}
      title={trimmed || undefined}
    >
      {children}
      {trimmed ? (
        <span className="badge-tooltip-popup" role="tooltip">
          {trimmed}
        </span>
      ) : null}
    </div>
  );
}

export function BadgeTooltipStyles() {
  return (
    <style>{`
      .badge-tooltip-host {
        position: relative;
        cursor: help;
      }

      .badge-tooltip-popup {
        position: absolute;
        left: 50%;
        bottom: calc(100% + 8px);
        transform: translateX(-50%) translateY(4px);
        z-index: 20;
        width: max-content;
        max-width: min(240px, 90vw);
        padding: 8px 10px;
        border-radius: ${gamificationTheme.radiusSm};
        background: #0f172a;
        color: #fff;
        font-size: 12px;
        line-height: 1.4;
        text-align: center;
        box-shadow: 0 8px 20px rgba(15, 23, 42, 0.18);
        pointer-events: none;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.15s ease, transform 0.15s ease, visibility 0.15s ease;
      }

      .badge-tooltip-popup::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 6px solid transparent;
        border-top-color: ${gamificationTheme.title};
      }

      .badge-tooltip-host:hover .badge-tooltip-popup,
      .badge-tooltip-host:focus-visible .badge-tooltip-popup {
        opacity: 1;
        visibility: visible;
        transform: translateX(-50%) translateY(0);
      }
    `}</style>
  );
}
