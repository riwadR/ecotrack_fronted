import {
  customDateRangeToResolved,
  dateRangeToQueryParams,
  type CustomDateRangeInput,
  type ResolvedDateRange,
} from "@/lib/dateFilter";

export type DateRangeQueryInput = CustomDateRangeInput | ResolvedDateRange;

function isResolvedDateRange(input: DateRangeQueryInput): input is ResolvedDateRange {
  const { startDate, endDate } = input;
  return (
    startDate === null ||
    endDate === null ||
    (typeof startDate === "string" && startDate.includes("T")) ||
    (typeof endDate === "string" && endDate.includes("T"))
  );
}

export function buildDateRangeParams(input?: DateRangeQueryInput): Record<string, string> {
  if (input == null) {
    return {};
  }
  const range = isResolvedDateRange(input)
    ? input
    : customDateRangeToResolved(input);
  return dateRangeToQueryParams(range);
}
