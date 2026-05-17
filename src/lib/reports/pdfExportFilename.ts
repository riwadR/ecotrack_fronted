/**
 * Mirrors backend {@code ReportExportFilenameHelper} for UC-G03 PDF downloads.
 */
export function buildPdfExportFilename(
  startDate?: string,
  endDate?: string
): string {
  const prefix = "Rapport-Situation-Ecotrack_";
  const now = new Date();
  const start = startDate ? new Date(startDate) : startOfCurrentMonth(now);
  const end = endDate ? new Date(endDate) : now;

  if (isFullCalendarMonth(start, end)) {
    const month = String(start.getMonth() + 1).padStart(2, "0");
    const year = start.getFullYear();
    return `${prefix}${month}-${year}.pdf`;
  }

  return `${prefix}${formatDay(start)}_${formatDay(end)}.pdf`;
}

function startOfCurrentMonth(reference: Date): Date {
  return new Date(reference.getFullYear(), reference.getMonth(), 1, 0, 0, 0, 0);
}

function isFullCalendarMonth(start: Date, end: Date): boolean {
  if (
    start.getDate() !== 1 ||
    start.getMonth() !== end.getMonth() ||
    start.getFullYear() !== end.getFullYear()
  ) {
    return false;
  }
  const lastDay = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
  return end.getDate() === lastDay;
}

function formatDay(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export function parseContentDispositionFilename(
  header: string | undefined | null
): string | null {
  if (!header) {
    return null;
  }

  const utf8Match = /filename\*=UTF-8''([^;\n]+)/i.exec(header);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].trim());
    } catch {
      return utf8Match[1].trim();
    }
  }

  const asciiMatch = /filename="([^"]+)"/i.exec(header);
  if (asciiMatch?.[1]) {
    return asciiMatch[1].trim();
  }

  const looseMatch = /filename=([^;\n]+)/i.exec(header);
  return looseMatch?.[1]?.trim().replace(/^"|"$/g, "") ?? null;
}
