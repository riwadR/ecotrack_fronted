"use client";

import type { ReactNode } from "react";

const CARD_CLASS =
  "rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6 md:shadow-md";

type AnalyticsKpiCardProps = {
  label: string;
  value: string;
  accent?: string;
  subtext?: string;
};

export function AnalyticsKpiCard({
  label,
  value,
  accent = "#10b981",
  subtext,
}: AnalyticsKpiCardProps) {
  return (
    <div
      className={`${CARD_CLASS} border-t-[3px]`}
      style={{ borderTopColor: accent }}
    >
      <p className="m-0 text-2xl font-bold tabular-nums text-slate-900 md:text-3xl">
        {value}
      </p>
      <p className="m-0 mt-1 text-sm font-medium text-slate-600">{label}</p>
      {subtext ? (
        <p className="m-0 mt-0.5 text-xs text-slate-500">{subtext}</p>
      ) : null}
    </div>
  );
}

type AnalyticsSectionProps = {
  title: string;
  description?: string;
  includeInExport: boolean;
  onIncludeInExportChange: (value: boolean) => void;
  exportDisabled?: boolean;
  children: ReactNode;
};

export function AnalyticsSection({
  title,
  description,
  includeInExport,
  onIncludeInExportChange,
  exportDisabled = false,
  children,
}: AnalyticsSectionProps) {
  return (
    <section className={CARD_CLASS}>
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="m-0 text-lg font-bold tracking-tight text-slate-900 md:text-xl">
            {title}
          </h2>
          {description ? (
            <p className="m-0 mt-1 text-sm leading-relaxed text-slate-600">
              {description}
            </p>
          ) : null}
        </div>
        <label className="inline-flex shrink-0 cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
          <input
            type="checkbox"
            role="switch"
            checked={includeInExport}
            disabled={exportDisabled}
            onChange={(e) => onIncludeInExportChange(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          Inclure dans l&apos;export PDF
        </label>
      </div>
      <div className="pt-5">{children}</div>
    </section>
  );
}

type RankedBarListProps = {
  items: { label: string; count: number }[];
  emptyLabel?: string;
  barColor?: string;
};

export function RankedBarList({
  items,
  emptyLabel = "Aucune donnée sur cette période",
  barColor = "#10b981",
}: RankedBarListProps) {
  if (!items.length) {
    return (
      <p className="m-0 rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
        {emptyLabel}
      </p>
    );
  }

  const max = Math.max(...items.map((i) => i.count), 1);

  return (
    <ul className="m-0 flex list-none flex-col gap-3 p-0">
      {items.map((item) => (
        <li key={item.label}>
          <div className="mb-1 flex items-center justify-between gap-2 text-sm">
            <span className="font-medium text-slate-800">{item.label}</span>
            <span className="shrink-0 tabular-nums font-semibold text-slate-900">
              {item.count}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.max(4, (item.count / max) * 100)}%`,
                backgroundColor: barColor,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ReportsMetricsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {[1, 2, 3].map((section) => (
        <div key={section} className={`${CARD_CLASS} animate-pulse`}>
          <div className="mb-5 h-6 w-48 rounded-md bg-slate-200" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((kpi) => (
              <div key={kpi} className="h-24 rounded-lg bg-slate-100" />
            ))}
          </div>
          <div className="mt-5 h-40 rounded-lg bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export function formatMetricNumber(value: number, decimals = 0): string {
  return value.toLocaleString("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

type ReportStatusFunnelStat = {
  label: string;
  value: number;
  valueClass: string;
  borderClass: string;
};

type ReportStatusFunnelProps = {
  pending: number;
  validated: number;
  inProgress: number;
  resolved: number;
  rejected: number;
  totalSignalements: number;
  withPhoto: number;
};

export function ReportStatusFunnel({
  pending,
  validated,
  inProgress,
  resolved,
  rejected,
  totalSignalements,
  withPhoto,
}: ReportStatusFunnelProps) {
  const lifecycleTotal = pending + validated + inProgress + resolved + rejected;

  const stats: ReportStatusFunnelStat[] = [
    {
      label: "En attente de validation",
      value: pending,
      valueClass: "text-amber-700",
      borderClass: "border-t-amber-400",
    },
    {
      label: "À traiter / Validés",
      value: validated,
      valueClass: "text-sky-700",
      borderClass: "border-t-sky-500",
    },
    {
      label: "Résolus",
      value: resolved,
      valueClass: "text-emerald-700",
      borderClass: "border-t-emerald-500",
    },
    {
      label: "Rejetés",
      value: rejected,
      valueClass: "text-red-700",
      borderClass: "border-t-red-500",
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <p className="m-0 text-sm font-semibold text-slate-800">
        Entonnoir opérationnel des signalements
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`${CARD_CLASS} border-t-[3px] ${stat.borderClass}`}
          >
            <p
              className={`m-0 text-2xl font-bold tabular-nums md:text-3xl ${stat.valueClass}`}
            >
              {formatMetricNumber(stat.value)}
            </p>
            <p className="m-0 mt-1 text-sm font-medium leading-snug text-slate-600">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
      <p className="m-0 text-xs text-slate-500">
        {formatMetricNumber(lifecycleTotal)} sur{" "}
        {formatMetricNumber(totalSignalements)} signalements au total ·{" "}
        {formatMetricNumber(withPhoto)} avec photo
        {inProgress > 0
          ? ` · ${formatMetricNumber(inProgress)} en cours de traitement`
          : ""}
      </p>
    </div>
  );
}
