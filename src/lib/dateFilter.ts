export type ResolvedDateRange = {
  startDate: string | null;
  endDate: string | null;
};

/** UI state: `yyyy-MM-dd` from &lt;input type="date"&gt; (empty = unset). */
export type CustomDateRangeInput = {
  startDate: string;
  endDate: string;
};

/** Converts custom date inputs to ISO bounds for API query params. */
export function customDateRangeToResolved(
  input: CustomDateRangeInput
): ResolvedDateRange {
  const startTrimmed = input.startDate.trim();
  const endTrimmed = input.endDate.trim();

  if (!startTrimmed && !endTrimmed) {
    return { startDate: null, endDate: null };
  }

  let startIso: string | null = null;
  let endIso: string | null = null;

  if (startTrimmed) {
    const start = new Date(`${startTrimmed}T00:00:00`);
    if (!Number.isNaN(start.getTime())) {
      startIso = start.toISOString();
    }
  }

  if (endTrimmed) {
    const end = new Date(`${endTrimmed}T23:59:59.999`);
    if (!Number.isNaN(end.getTime())) {
      endIso = end.toISOString();
    }
  }

  return { startDate: startIso, endDate: endIso };
}

export function dateRangeToQueryParams(
  range: ResolvedDateRange
): Record<string, string> {
  const params: Record<string, string> = {};
  if (range.startDate) {
    params.startDate = range.startDate;
  }
  if (range.endDate) {
    params.endDate = range.endDate;
  }
  return params;
}

/** Preset helper retained for dashboard KPI « collectes aujourd'hui ». */
export function todayDateRange(): ResolvedDateRange {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return { startDate: start.toISOString(), endDate: end.toISOString() };
}
