"use client";

import { useCallback, useEffect, useState } from "react";
import {
  customDateRangeToResolved,
  dateRangeToQueryParams,
  type CustomDateRangeInput,
} from "@/lib/dateFilter";
import type { ReportMetrics } from "@/models/reportMetrics";
import { fetchReportMetrics } from "@/services/api/reports";

export function useReportMetrics(dateRange: CustomDateRangeInput) {
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resolved = customDateRangeToResolved(dateRange);
      const { startDate, endDate } = dateRangeToQueryParams(resolved);
      const data = await fetchReportMetrics({ startDate, endDate });
      setMetrics(data);
    } catch (err) {
      setMetrics(null);
      setError(
        err instanceof Error ? err.message : "Impossible de charger les indicateurs."
      );
    } finally {
      setLoading(false);
    }
  }, [dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    void load();
  }, [load]);

  return { metrics, loading, error, reload: load };
}
