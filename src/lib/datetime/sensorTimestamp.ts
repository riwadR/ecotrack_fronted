/** Values accepted from Spring/Jackson `LocalDateTime` JSON shapes. */
export type SensorTimestampInput = string | (number | string)[] | null | undefined;

/**
 * Normalizes backend sensor timestamps (ISO string, `YYYY-MM-DD HH:mm:ss`, or Jackson array) to ISO-8601.
 * Returns null when the value is missing or cannot be parsed.
 */
export function normalizeSensorTimestampToIso(value: SensorTimestampInput): string | null {
  if (value == null) {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    const normalized = trimmed.includes("T") ? trimmed : trimmed.replace(" ", "T");
    const parsed = Date.parse(normalized);
    return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null;
  }

  if (Array.isArray(value) && value.length >= 3) {
    const year = Number(value[0]);
    const monthIndex = Number(value[1]) - 1;
    const day = Number(value[2]);
    const hour = value.length > 3 ? Number(value[3]) : 0;
    const minute = value.length > 4 ? Number(value[4]) : 0;
    const second = value.length > 5 ? Number(value[5]) : 0;
    if ([year, monthIndex, day, hour, minute, second].every((n) => Number.isFinite(n))) {
      return new Date(Date.UTC(year, monthIndex, day, hour, minute, second)).toISOString();
    }
  }

  return null;
}

/**
 * French display for a sensor timestamp; shows an em dash when unknown.
 */
export function formatSensorTimestampFr(
  iso: string | null | undefined,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "short" }
): string {
  if (!iso) {
    return "—";
  }
  const parsed = Date.parse(iso);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return "—";
  }
  return new Date(parsed).toLocaleString("fr-FR", options);
}
