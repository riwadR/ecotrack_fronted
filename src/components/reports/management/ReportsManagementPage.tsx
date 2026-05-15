"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReportListItem, ReportManagementTabStatus, ReportUpdateStatus } from "@/models/report";
import { getReports, updateReportStatus } from "@/services/api/reports";
import ReportToast from "@/components/reports/ReportToast";
import ReportCard from "@/components/reports/management/ReportCard";
import ReportReviewDrawer from "@/components/reports/management/ReportReviewDrawer";
import ReportStatusTabs from "@/components/reports/management/ReportStatusTabs";
import { PAGE_DESCRIPTION_CLASS, PAGE_TITLE_CLASS } from "@/lib/ui/appChrome";

const EMPTY_COUNTS: Record<ReportManagementTabStatus, number> = {
  PENDING: 0,
  VALIDATED: 0,
  RESOLVED: 0,
  REJECTED: 0,
};

/**
 * Back-office dashboard for agents and admins to review and update report statuses.
 */
export default function ReportsManagementPage() {
  const [activeTab, setActiveTab] = useState<ReportManagementTabStatus>("PENDING");
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [tabCounts, setTabCounts] = useState(EMPTY_COUNTS);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportListItem | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const refreshTabCounts = useCallback(async () => {
    try {
      const [pending, toProcess, resolved, rejected] = await Promise.all([
        getReports("PENDING"),
        getReports("VALIDATED"),
        getReports("RESOLVED"),
        getReports("REJECTED"),
      ]);
      setTabCounts({
        PENDING: pending.length,
        VALIDATED: toProcess.length,
        RESOLVED: resolved.length,
        REJECTED: rejected.length,
      });
    } catch {
      /* counts are non-blocking */
    }
  }, []);

  const loadReports = useCallback(async (status: ReportManagementTabStatus) => {
    setLoadError(null);
    setIsLoading(true);
    try {
      const data = await getReports(status);
      setReports(data);
    } catch (err) {
      setReports([]);
      setLoadError(err instanceof Error ? err.message : "Impossible de charger les signalements.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshTabCounts();
  }, [refreshTabCounts]);

  useEffect(() => {
    void loadReports(activeTab);
  }, [activeTab, loadReports]);

  const handleTabChange = (status: ReportManagementTabStatus) => {
    setActiveTab(status);
    setSelectedReport(null);
    setUpdateError(null);
  };

  const handleStatusChange = useCallback(
    async (newStatus: ReportUpdateStatus) => {
      if (!selectedReport) {
        return;
      }

      const reportId = selectedReport.id;
      const previousReports = reports;
      const closedReport = selectedReport;

      setReports((current) => current.filter((r) => r.id !== reportId));
      setSelectedReport(null);
      setUpdateError(null);
      setIsUpdating(true);

      const successLabels: Record<ReportUpdateStatus, string> = {
        VALIDATED: "Signalement accepté — à traiter.",
        REJECTED: "Signalement rejeté.",
        RESOLVED: "Signalement marqué comme résolu.",
        PENDING: "Signalement rouvert — en attente de validation.",
      };
      setToastMessage(successLabels[newStatus]);

      try {
        await updateReportStatus(reportId, { status: newStatus });
        void refreshTabCounts();
      } catch (err) {
        setReports(previousReports);
        setSelectedReport(closedReport);
        setToastMessage(null);
        setUpdateError(
          err instanceof Error ? err.message : "Impossible de mettre à jour le signalement."
        );
      } finally {
        setIsUpdating(false);
      }
    },
    [selectedReport, reports, refreshTabCounts]
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className={PAGE_TITLE_CLASS}>Gestion des signalements</h1>
        <p className={PAGE_DESCRIPTION_CLASS}>
          Validez, rejetez ou résolvez les signalements citoyens et agents. Vue par défaut : en attente.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md shadow-slate-200/40 sm:p-5">
        <ReportStatusTabs
          activeStatus={activeTab}
          counts={tabCounts}
          onChange={handleTabChange}
        />

        {loadError ? (
          <div
            className="mt-4 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
            role="alert"
          >
            <p className="m-0 font-medium">{loadError}</p>
            <button
              type="button"
              className="self-start rounded-md bg-red-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-800"
              onClick={() => void loadReports(activeTab)}
            >
              Réessayer
            </button>
          </div>
        ) : null}

        <div className="mt-5">
          {isLoading ? (
            <p className="m-0 text-center text-sm text-slate-500" role="status">
              Chargement des signalements…
            </p>
          ) : reports.length === 0 ? (
            <p className="m-0 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600">
              Aucun signalement dans cette catégorie.
            </p>
          ) : (
            <ul className="m-0 grid list-none gap-3 lg:grid-cols-2">
              {reports.map((report) => (
                <li key={report.id}>
                  <ReportCard report={report} onClick={() => setSelectedReport(report)} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {selectedReport ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[999] bg-slate-900/30"
            aria-label="Fermer le panneau"
            onClick={() => !isUpdating && setSelectedReport(null)}
          />
          <ReportReviewDrawer
            report={selectedReport}
            isUpdating={isUpdating}
            updateError={updateError}
            onClose={() => {
              if (!isUpdating) {
                setSelectedReport(null);
                setUpdateError(null);
              }
            }}
            onStatusChange={(status) => void handleStatusChange(status)}
          />
        </>
      ) : null}

      {toastMessage ? (
        <ReportToast message={toastMessage} onDismiss={() => setToastMessage(null)} />
      ) : null}
    </div>
  );
}
