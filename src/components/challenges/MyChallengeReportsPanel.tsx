"use client";

import { useEffect, useState } from "react";
import { getMyChallengeReports, type ChallengeUserReport } from "@/lib/api/challenges";
import { formatContributionDateTime } from "@/lib/challenges/challengeUtils";
import { getReportTypeLabel } from "@/lib/reports/reportTypeLabels";

export default function MyChallengeReportsPanel() {
  const [reports, setReports] = useState<ChallengeUserReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getMyChallengeReports();
        if (!cancelled) {
          setReports(data);
        }
      } catch (err) {
        if (!cancelled) {
          setReports([]);
          setError(err instanceof Error ? err.message : "Impossible de charger vos signalements.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Chargement de vos signalements…</p>;
  }

  if (error) {
    return (
      <p className="text-sm font-medium text-red-600" role="alert">
        {error}
      </p>
    );
  }

  if (reports.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
        Vous n&apos;avez pas encore de signalement validé dans vos défis.
      </p>
    );
  }

  return (
    <ul className="m-0 grid list-none gap-3 p-0">
      {reports.map((report) => (
        <li
          key={`${report.challengeId}-${report.reportId}`}
          className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <span className="font-semibold text-emerald-800">{report.challengeTitle}</span>
            <time className="text-xs text-slate-500" dateTime={report.occurredAt}>
              {formatContributionDateTime(report.occurredAt)}
            </time>
          </div>
          <p className="mt-2 font-medium text-slate-900">{getReportTypeLabel(report.reportType)}</p>
          <p className="mt-1 text-xs text-slate-600">
            {report.zoneName} · Conteneur {report.containerSerialNumber}
          </p>
        </li>
      ))}
    </ul>
  );
}
