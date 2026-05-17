"use client";

import { Calendar, X } from "lucide-react";
import type { CustomDateRangeInput } from "@/lib/dateFilter";
import { APP_FORM_CONTROL_CLASS, APP_FORM_LABEL_CLASS } from "@/lib/ui/appChrome";

export type DateRangeFilterProps = {
  value: CustomDateRangeInput;
  onChange: (value: CustomDateRangeInput) => void;
  disabled?: boolean;
  className?: string;
};

export default function DateRangeFilter({
  value,
  onChange,
  disabled = false,
  className = "",
}: DateRangeFilterProps) {
  const hasSelection = Boolean(value.startDate || value.endDate);

  const fieldClass = `${APP_FORM_CONTROL_CLASS} pl-9`;

  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end ${className}`}
    >
      <label className={`${APP_FORM_LABEL_CLASS} min-w-[10.5rem] flex-1 sm:max-w-[11rem]`}>
        Date de début
        <span className="relative mt-1 block">
          <Calendar
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="date"
            value={value.startDate}
            disabled={disabled}
            max={value.endDate || undefined}
            onChange={(e) =>
              onChange({ ...value, startDate: e.target.value })
            }
            className={fieldClass}
          />
        </span>
      </label>

      <label className={`${APP_FORM_LABEL_CLASS} min-w-[10.5rem] flex-1 sm:max-w-[11rem]`}>
        Date de fin
        <span className="relative mt-1 block">
          <Calendar
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="date"
            value={value.endDate}
            disabled={disabled}
            min={value.startDate || undefined}
            onChange={(e) =>
              onChange({ ...value, endDate: e.target.value })
            }
            className={fieldClass}
          />
        </span>
      </label>

      {hasSelection ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange({ startDate: "", endDate: "" })}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <X className="h-4 w-4" aria-hidden />
          Effacer les dates
        </button>
      ) : null}
    </div>
  );
}
