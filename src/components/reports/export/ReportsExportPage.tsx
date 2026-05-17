"use client";

import { useCallback, useState } from "react";
import { Download, Loader2, Mail } from "lucide-react";
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
import {
  exportPdfReport,
  sendPdfReportByEmail,
  type PdfExportModuleFlags,
} from "@/services/api/reports";

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

type ModuleKey = keyof PdfExportModuleFlags;

const MODULE_OPTIONS: Array<{
  key: ModuleKey;
  label: string;
  description: string;
}> = [
  {
    key: "includeLogistics",
    label: "Logistique & Opérations",
    description: "Tournées, volumes collectés, CO2 évité et détails opérationnels.",
  },
  {
    key: "includeIot",
    label: "Supervision IoT",
    description: "Alertes actives/résolues et classements par zone et type de conteneur.",
  },
  {
    key: "includeGamification",
    label: "Engagement Citoyen & Gamification",
    description: "Signalements, défis, points citoyens et répartition des incidents.",
  },
];

const defaultModules: Required<PdfExportModuleFlags> = {
  includeLogistics: true,
  includeIot: true,
  includeGamification: true,
};

export default function ReportsExportPage() {
  const [dateRange, setDateRange] = useState<CustomDateRangeInput>({
    startDate: "",
    endDate: "",
  });
  const [modules, setModules] = useState<Required<PdfExportModuleFlags>>(defaultModules);
  const [downloading, setDownloading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "warning";
  } | null>(null);

  const busy = downloading || sendingEmail;

  const buildExportParams = useCallback(() => {
    const resolved = customDateRangeToResolved(dateRange);
    const { startDate, endDate } = dateRangeToQueryParams(resolved);
    return { startDate, endDate, ...modules };
  }, [dateRange, modules]);

  const toggleModule = (key: ModuleKey) => {
    setModules((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    setToast(null);

    try {
      const { blob, filename } = await exportPdfReport(buildExportParams());
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
  }, [buildExportParams]);

  const handleSendEmail = useCallback(async () => {
    setSendingEmail(true);
    setToast(null);

    try {
      await sendPdfReportByEmail(buildExportParams());
      setToast({ message: "Rapport envoyé sur votre boîte mail", variant: "success" });
    } catch (error) {
      setToast({
        message:
          error instanceof Error
            ? error.message
            : "Impossible d'envoyer le rapport par e-mail.",
        variant: "warning",
      });
    } finally {
      setSendingEmail(false);
    }
  }, [buildExportParams]);

  return (
    <div className={PAGE_STACK_CLASS}>
      <header>
        <h1 className={PAGE_TITLE_CLASS}>Génération de Rapports</h1>
        <p className={PAGE_DESCRIPTION_CLASS}>
          Générez un rapport PDF consolidant les modules de votre choix, puis
          téléchargez-le ou recevez-le par e-mail.
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
            disabled={busy}
          />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="m-0 text-base font-semibold text-slate-900">
          Modules à inclure
        </h2>
        <p className="m-0 mt-1 text-sm text-slate-600">
          Cochez les sections à intégrer dans le rapport PDF.
        </p>
        <ul className="m-0 mt-4 grid list-none gap-3 p-0">
          {MODULE_OPTIONS.map(({ key, label, description }) => (
            <li key={key}>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50/80 p-3 transition hover:border-emerald-200 hover:bg-emerald-50/40 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
                <input
                  type="checkbox"
                  checked={modules[key]}
                  disabled={busy}
                  onChange={() => toggleModule(key)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-900">
                    {label}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-slate-600">
                    {description}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={() => void handleDownload()}
          disabled={busy}
          className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[14rem] sm:flex-none"
        >
          {downloading ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          ) : (
            <Download className="h-5 w-5" aria-hidden />
          )}
          {downloading ? "Génération…" : "Télécharger le PDF"}
        </button>

        <button
          type="button"
          onClick={() => void handleSendEmail()}
          disabled={busy}
          className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[14rem] sm:flex-none"
        >
          {sendingEmail ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          ) : (
            <Mail className="h-5 w-5" aria-hidden />
          )}
          {sendingEmail ? "Envoi en cours…" : "Envoyer par e-mail"}
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