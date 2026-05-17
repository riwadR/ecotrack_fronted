"use client";

import { Bot, HardHat, User } from "lucide-react";
import type { ReportOrigin } from "@/models/report";

export type ReportOriginBadgeProps = {
  origin?: ReportOrigin | null;
  className?: string;
};

const ORIGIN_CONFIG: Record<
  ReportOrigin,
  { label: string; className: string; Icon: typeof User }
> = {
  SYSTEM: {
    label: "IoT / Système",
    className: "bg-violet-50 text-violet-900 ring-violet-200",
    Icon: Bot,
  },
  AGENT: {
    label: "Agent",
    className: "bg-sky-50 text-sky-900 ring-sky-200",
    Icon: HardHat,
  },
  CITIZEN: {
    label: "Citoyen",
    className: "bg-emerald-50 text-emerald-900 ring-emerald-200",
    Icon: User,
  },
};

export default function ReportOriginBadge({ origin, className = "" }: ReportOriginBadgeProps) {
  const resolved = origin ?? "CITIZEN";
  const config = ORIGIN_CONFIG[resolved];
  const Icon = config.Icon;

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${config.className} ${className}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="truncate">{config.label}</span>
    </span>
  );
}
