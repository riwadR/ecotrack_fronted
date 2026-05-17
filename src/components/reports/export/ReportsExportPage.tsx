"use client";

import { useCallback, useState } from "react";
import { AlertCircle, Download, Loader2, Mail } from "lucide-react";
import DateRangeFilter from "@/components/ui/DateRangeFilter";
import ReportToast from "@/components/reports/ReportToast";
import MetricsBarChart from "@/components/reports/analytics/MetricsBarChart";
import ToursAnalyticsList from "@/components/reports/analytics/ToursAnalyticsList";
import {
  AnalyticsKpiCard,
  AnalyticsSection,
  RankedBarList,
  ReportStatusFunnel,
  ReportsMetricsSkeleton,
  formatMetricNumber,
} from "@/components/reports/analytics/reportAnalyticsUi";
import { useReportMetrics } from "@/hooks/useReportMetrics";
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

const defaultModules: Required<PdfExportModuleFlags> = {
  includeLogistics: true,
  includeIot: true,
  includeGamification: true,
};

function ExportActionButtons({
  busy,
  downloading,
  sendingEmail,
  onDownload,
  onSendEmail,
  className = "",
}: {
  busy: boolean;
  downloading: boolean;
  sendingEmail: boolean;
  onDownload: () => void;
  onSendEmail: () => void;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 sm:flex-row sm:gap-3 ${className}`}>
      <button
        type="button"
        onClick={onDownload}
        disabled={busy}
        className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[10rem] sm:flex-none"
      >
        {downloading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Download className="h-4 w-4" aria-hidden />
        )}
        {downloading ? "Génération…" : "Télécharger le PDF"}
      </button>
      <button
        type="button"
        onClick={onSendEmail}
        disabled={busy}
        className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[10rem] sm:flex-none"
      >
        {sendingEmail ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Mail className="h-4 w-4" aria-hidden />
        )}
        {sendingEmail ? "Envoi…" : "Envoyer par e-mail"}
      </button>
    </div>
  );
}

export default function ReportsExportPage() {
  const [dateRange, setDateRange] = useState<CustomDateRangeInput>({
    startDate: "",
    endDate: "",
  });
  const [modules, setModules] =
    useState<Required<PdfExportModuleFlags>>(defaultModules);
  const [downloading, setDownloading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "warning";
  } | null>(null);

  const { metrics, loading, error } = useReportMetrics(dateRange);
  const busy = downloading || sendingEmail || loading;

  const buildExportParams = useCallback(() => {
    const resolved = customDateRangeToResolved(dateRange);
    const { startDate, endDate } = dateRangeToQueryParams(resolved);
    return { startDate, endDate, ...modules };
  }, [dateRange, modules]);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    setToast(null);
    try {
      const { blob, filename } = await exportPdfReport(buildExportParams());
      triggerBlobDownload(blob, filename);
      setToast({ message: "Rapport téléchargé avec succès", variant: "success" });
    } catch (err) {
      setToast({
        message:
          err instanceof Error
            ? err.message
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
    } catch (err) {
      setToast({
        message:
          err instanceof Error
            ? err.message
            : "Impossible d'envoyer le rapport par e-mail.",
        variant: "warning",
      });
    } finally {
      setSendingEmail(false);
    }
  }, [buildExportParams]);

  const totalSignalements = metrics
    ? metrics.citizenReports + metrics.agentReports + metrics.systemReports
    : 0;

  const exportHandlers = {
    onDownload: () => void handleDownload(),
    onSendEmail: () => void handleSendEmail(),
  };

  return (
    <div className={`${PAGE_STACK_CLASS} pb-28 lg:pb-8`}>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className={PAGE_TITLE_CLASS}>Analytics &amp; Rapports</h1>
          <p className={PAGE_DESCRIPTION_CLASS}>
            Explorez les indicateurs de la période sélectionnée, puis exportez
            uniquement les sections souhaitées en PDF ou par e-mail.
          </p>
        </div>
        <ExportActionButtons
          busy={busy}
          downloading={downloading}
          sendingEmail={sendingEmail}
          className="hidden shrink-0 lg:flex"
          {...exportHandlers}
        />
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6 md:shadow-md">
        <h2 className="m-0 text-base font-semibold text-slate-900">
          Période d&apos;analyse
        </h2>
        <p className="m-0 mt-1 text-sm text-slate-600">
          Laissez les dates vides pour le mois en cours (du 1er au jour présent).
          Les indicateurs se mettent à jour automatiquement.
        </p>
        <div className="mt-4">
          <DateRangeFilter
            value={dateRange}
            onChange={setDateRange}
            disabled={downloading || sendingEmail}
          />
        </div>
      </section>

      {error ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <p className="m-0">{error}</p>
        </div>
      ) : null}

      {loading ? (
        <ReportsMetricsSkeleton />
      ) : metrics ? (
        <div className="flex flex-col gap-6">
          <AnalyticsSection
            title="Logistique & Opérations"
            description="Tournées réalisées, distances parcourues et impact carbone estimé."
            includeInExport={modules.includeLogistics}
            onIncludeInExportChange={(v) =>
              setModules((m) => ({ ...m, includeLogistics: v }))
            }
            exportDisabled={busy}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <AnalyticsKpiCard
                label="Tournées"
                value={formatMetricNumber(metrics.completedTours)}
                accent="#10b981"
                subtext={`${formatMetricNumber(metrics.totalVolumeCollected)} L collectés`}
              />
              <AnalyticsKpiCard
                label="Distance"
                value={`${formatMetricNumber(metrics.totalDistanceKm, 1)} km`}
                accent="#0ea5e9"
                subtext={`Délai moyen entre collectes : ${metrics.avgTimeBetweenPickups}`}
              />
              <AnalyticsKpiCard
                label="CO₂ évité"
                value={`${formatMetricNumber(metrics.estimatedCo2Saved, 1)} kg`}
                accent="#8b5cf6"
              />
            </div>
            <div className="mt-6">
              <h3 className="m-0 mb-3 text-sm font-semibold text-slate-800">
                Détail des tournées
              </h3>
              <ToursAnalyticsList tours={metrics.tours} />
            </div>
          </AnalyticsSection>

          <AnalyticsSection
            title="Supervision IoT"
            description="Alertes capteurs et zones les plus sollicitées."
            includeInExport={modules.includeIot}
            onIncludeInExportChange={(v) =>
              setModules((m) => ({ ...m, includeIot: v }))
            }
            exportDisabled={busy}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <AnalyticsKpiCard
                label="Alertes actives"
                value={formatMetricNumber(metrics.activeAlerts)}
                accent="#f59e0b"
              />
              <AnalyticsKpiCard
                label="Alertes résolues"
                value={formatMetricNumber(metrics.resolvedAlerts)}
                accent="#10b981"
              />
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="m-0 mb-3 text-sm font-semibold text-slate-800">
                  Top zones
                </h3>
                <RankedBarList
                  items={metrics.topZonesByAlerts}
                  barColor="#0ea5e9"
                  emptyLabel="Aucune alerte par zone sur cette période."
                />
              </div>
              <div>
                <h3 className="m-0 mb-3 text-sm font-semibold text-slate-800">
                  Top conteneurs
                </h3>
                <RankedBarList
                  items={metrics.topContainerTypesByAlerts}
                  barColor="#8b5cf6"
                  emptyLabel="Aucune alerte par type de conteneur."
                />
              </div>
            </div>
          </AnalyticsSection>

          <AnalyticsSection
            title="Engagement Citoyen"
            description="Signalements, points distribués et répartition par type."
            includeInExport={modules.includeGamification}
            onIncludeInExportChange={(v) =>
              setModules((m) => ({ ...m, includeGamification: v }))
            }
            exportDisabled={busy}
          >
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <AnalyticsKpiCard
                  label="Signalements totaux"
                  value={formatMetricNumber(totalSignalements)}
                  accent="#10b981"
                  subtext={`Citoyens ${metrics.citizenReports} · Agents ${metrics.agentReports} · Système ${metrics.systemReports}`}
                />
                <AnalyticsKpiCard
                  label="Points distribués"
                  value={formatMetricNumber(metrics.estimatedPointsDistributed)}
                  accent="#f59e0b"
                  subtext={`${formatMetricNumber(metrics.estimatedActiveUsers)} utilisateurs actifs estimés`}
                />
              </div>
              <ReportStatusFunnel
                pending={metrics.reportsPending}
                validated={metrics.reportsValidated}
                inProgress={metrics.reportsInProgress}
                resolved={metrics.reportsResolved}
                rejected={metrics.reportsRejected}
                totalSignalements={totalSignalements}
                withPhoto={metrics.reportsWithPhoto}
              />
            </div>
            {metrics.reportsByType.length > 0 ? (
              <div className="mt-6">
                <MetricsBarChart
                  title="Signalements par type"
                  labels={metrics.reportsByType.map((r) => r.label)}
                  values={metrics.reportsByType.map((r) => r.count)}
                />
              </div>
            ) : null}
            {metrics.challenges.length > 0 ? (
              <div className="mt-6">
                <h3 className="m-0 mb-3 text-sm font-semibold text-slate-800">
                  Défis citoyens
                </h3>
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {metrics.challenges.map((c) => (
                    <li
                      key={c.name}
                      className="flex flex-col gap-1 rounded-lg border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="font-medium text-slate-900">{c.name}</span>
                      <span className="text-slate-600">
                        {c.participantCount} participants · {c.reportsCount}{" "}
                        signalements · {c.outcomeLabel}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </AnalyticsSection>
        </div>
      ) : null}

      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-4 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm lg:hidden"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <ExportActionButtons
          busy={busy}
          downloading={downloading}
          sendingEmail={sendingEmail}
          {...exportHandlers}
        />
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
