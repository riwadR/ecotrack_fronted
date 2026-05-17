"use client";

import { useCallback, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import DateRangeFilter from "@/components/ui/DateRangeFilter";
import ReportToast from "@/components/reports/ReportToast";
import {
  PAGE_DESCRIPTION_CLASS,
  PAGE_STACK_CLASS,
  PAGE_TITLE_CLASS,
} from "@/lib/ui/appChrome";
import {
  customDateRangeToResolved,
  dateRangeToQueryParams,
  type CustomDateRangeInput,
} from "@/lib/dateFilter";
import { exportPdfReport } from "@/services/api/reports";

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export default function ReportsExportPage() {
  const [dateRange, setDateRange] = useState<CustomDateRangeInput>({
    startDate: "",
    endDate: "",
  });
  const [downloading, setDownloading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "warning";
  } | null>(null);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    setToast(null);

    try {
      const resolved = customDateRangeToResolved(dateRange);
      const { startDate, endDate } = dateRangeToQueryParams(resolved);
      const { blob, filename } = await exportPdfReport(startDate, endDate);
      triggerBlobDownload(blob, filename);
      setToast({ message: "Rapport téléchargé avec succès", variant: "success" });
    } catch (error) {
      setToast({
        message:
          error instanceof Error
            ? error.message
            : "Impossible de télécharger le rapport.",
        variant: "warning",
      });
    } finally {
      setDownloading(false);
    }
  }, [dateRange]);

  return (
    <div className={PAGE_STACK_CLASS}>
      <header>
        <h1 className={PAGE_TITLE_CLASS}>Génération de Rapports</h1>
        <p className={PAGE_DESCRIPTION_CLASS}>
          Générez un rapport PDF complet consolidant les données logistiques, IoT et
          l&apos;engagement citoyen.
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="m-0 text-base font-semibold text-slate-900">
          Période d&apos;analyse
        </h2>
        <p className="m-0 mt-1 text-sm text-slate-600">
          Laissez les dates vides pour utiliser le mois en cours (du 1er au jour
          présent).
        </p>
        <div className="mt-4">
          <DateRangeFilter
            value={dateRange}
            onChange={setDateRange}
            disabled={downloading}
          />
        </div>
      </section>

      <div>
        <button
          type="button"
          onClick={() => void handleDownload()}
          disabled={downloading}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {downloading ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          ) : (
            <Download className="h-5 w-5" aria-hidden />
          )}
          {downloading ? "Génération en cours…" : "Générer et Télécharger le PDF"}
        </button>
      </div>

      {toast ? (
        <ReportToast
          message={toast.message}
          variant={toast.variant === "success" ? "success" : "warning"}
          onDismiss={() => setToast(null)}
        />
      ) : null}
    </div>
  );
}
