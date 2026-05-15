"use client";

import type { ReportManagementTabStatus } from "@/models/report";
import {
  getReportManagementTabDescription,
  REPORT_MANAGEMENT_TABS,
} from "@/lib/reports/reportStatusLabels";

export type ReportStatusTabsProps = {
  activeStatus: ReportManagementTabStatus;
  counts: Record<ReportManagementTabStatus, number>;
  onChange: (status: ReportManagementTabStatus) => void;
};

export default function ReportStatusTabs({
  activeStatus,
  counts,
  onChange,
}: ReportStatusTabsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrer par statut">
        {REPORT_MANAGEMENT_TABS.map((tab) => {
          const isActive = activeStatus === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {tab.label}
              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {counts[tab.value]}
              </span>
            </button>
          );
        })}
      </div>
      <p className="m-0 text-sm text-slate-500" role="status">
        {getReportManagementTabDescription(activeStatus)}
      </p>
    </div>
  );
}
