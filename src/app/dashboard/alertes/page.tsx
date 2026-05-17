"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  Loader2,
} from "lucide-react";
import DateRangeFilter from "@/components/ui/DateRangeFilter";
import ReportToast from "@/components/reports/ReportToast";
import {
  PAGE_DESCRIPTION_CLASS,
  PAGE_STACK_CLASS,
  PAGE_TITLE_CLASS,
} from "@/lib/ui/appChrome";
import type { CustomDateRangeInput } from "@/lib/dateFilter";
import {
  getAlerts,
  resolveAlert,
  type AlertListItem,
} from "@/services/api/alerts";

const SEVERITY_FILTERS = [
  { id: "toutes", label: "Toutes actives" },
  { id: "critical", label: "Critiques" },
  { id: "warning", label: "Warnings" },
  { id: "resolues", label: "Résolues" },
] as const;

type SeverityFilterId = (typeof SEVERITY_FILTERS)[number]["id"];

function filterPillClass(active: boolean) {
  return active
    ? "border border-emerald-600 bg-emerald-600 text-white"
    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50";
}

function formatAlertDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function severityLabel(alert: AlertListItem): string {
  return alert.severity === "critical" ? "Critique" : "Warning";
}

function severityStyles(severity: AlertListItem["severity"]) {
  if (severity === "critical") {
    return { bg: "#fee2e2", color: "#dc2626", border: "#dc2626" };
  }
  return { bg: "#fef9c3", color: "#ca8a04", border: "#ca8a04" };
}

export default function AlertesPage() {
  const [dateRange, setDateRange] = useState<CustomDateRangeInput>({
    startDate: "",
    endDate: "",
  });
  const [filtre, setFiltre] = useState<SeverityFilterId>("toutes");
  const [alertes, setAlertes] = useState<AlertListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadAlertes = useCallback(async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const data = await getAlerts({ dateRange });
      setAlertes(data);
    } catch (error) {
      setAlertes([]);
      setLoadError(
        error instanceof Error ? error.message : "Impossible de charger les alertes."
      );
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    void loadAlertes();
  }, [loadAlertes]);

  const filtered = useMemo(() => {
    return alertes.filter((alert) => {
      if (filtre === "resolues") {
        return alert.status === "RESOLVED";
      }
      if (alert.status !== "ACTIVE") {
        return false;
      }
      if (filtre === "toutes") {
        return true;
      }
      return alert.severity === filtre;
    });
  }, [alertes, filtre]);

  const stats = useMemo(() => {
    const active = alertes.filter((a) => a.status === "ACTIVE");
    return {
      critical: active.filter((a) => a.severity === "critical").length,
      warning: active.filter((a) => a.severity === "warning").length,
      resolved: alertes.filter((a) => a.status === "RESOLVED").length,
    };
  }, [alertes]);

  const handleResolve = async (id: string) => {
    setResolvingId(id);
    try {
      await resolveAlert(id);
      setToast("Alerte marquée comme résolue.");
      await loadAlertes();
    } catch (error) {
      setToast(
        error instanceof Error ? error.message : "Impossible de résoudre l'alerte."
      );
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className={PAGE_STACK_CLASS}>
      <header>
        <h1 className={PAGE_TITLE_CLASS}>Alertes</h1>
        <p className={PAGE_DESCRIPTION_CLASS}>
          {stats.critical} critiques · {stats.warning} warnings · {stats.resolved} résolues
          {loading ? " · chargement…" : ""}
        </p>
      </header>

      <DateRangeFilter
        value={dateRange}
        onChange={setDateRange}
        disabled={loading}
      />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
        {[
          { label: "Critiques", value: stats.critical, color: "#dc2626", icon: CircleAlert },
          { label: "Warnings", value: stats.warning, color: "#ca8a04", icon: AlertTriangle },
          { label: "Résolues", value: stats.resolved, color: "#16a34a", icon: CheckCircle2 },
        ].map((k) => (
          <div
            key={k.label}
            className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm border-t-[3px]"
            style={{ borderTopColor: k.color }}
          >
            <k.icon className="mb-1 h-5 w-5" style={{ color: k.color }} aria-hidden />
            <p className="m-0 mb-1 text-2xl font-bold tabular-nums" style={{ color: k.color }}>
              {k.value}
            </p>
            <p className="m-0 text-xs text-slate-600">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {SEVERITY_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFiltre(f.id)}
            className={`cursor-pointer rounded-full px-4 py-1.5 text-[13px] font-medium transition ${filterPillClass(filtre === f.id)}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loadError ? (
        <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {loadError}
        </p>
      ) : null}

      <div className="grid gap-3">
        {loading ? (
          <p className="m-0 flex items-center justify-center gap-2 py-12 text-sm text-slate-500" role="status">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Chargement des alertes…
          </p>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <CheckCircle2 className="mx-auto mb-2 h-10 w-10 text-emerald-500" aria-hidden />
            <p className="m-0 font-semibold text-slate-600">
              Aucune alerte dans cette catégorie
            </p>
          </div>
        ) : (
          filtered.map((alert) => {
            const resolved = alert.status === "RESOLVED";
            const s = severityStyles(alert.severity);
            return (
              <div
                key={alert.id}
                className={`flex gap-4 rounded-xl border-l-4 border-solid p-4 pr-5 shadow-sm sm:p-5 ${
                  resolved ? "border-l-slate-200 bg-slate-50 opacity-80" : "bg-white"
                }`}
                style={{ borderLeftColor: resolved ? "#e2e8f0" : s.border }}
              >
                <span className="shrink-0 pt-0.5" style={{ color: resolved ? "#64748b" : s.color }}>
                  {resolved ? (
                    <CheckCircle2 className="h-7 w-7" aria-hidden />
                  ) : alert.severity === "critical" ? (
                    <CircleAlert className="h-7 w-7" aria-hidden />
                  ) : (
                    <AlertTriangle className="h-7 w-7" aria-hidden />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {alert.type === "CAPACITY_CRITICAL"
                        ? "Capacité critique"
                        : "Capacité — seuil d'alerte"}
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                      style={{ background: s.bg, color: s.color }}
                    >
                      {severityLabel(alert)}
                    </span>
                    {resolved ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                        Résolue
                      </span>
                    ) : null}
                  </div>
                  <p className="m-0 mb-0.5 text-[13px] text-slate-600">
                    {alert.description} — Capteur{" "}
                    <strong>{alert.containerSerialNumber}</strong>
                    {alert.zoneName ? ` · ${alert.zoneName}` : ""}
                  </p>
                  <p className="m-0 text-xs text-slate-400">
                    {formatAlertDate(alert.createdAt)}
                  </p>
                </div>
                {alert.status === "ACTIVE" ? (
                  <button
                    type="button"
                    disabled={resolvingId === alert.id}
                    onClick={() => void handleResolve(alert.id)}
                    className="inline-flex shrink-0 items-center gap-1.5 self-start whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-[13px] font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    {resolvingId === alert.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" aria-hidden />
                    )}
                    Résoudre
                  </button>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      {toast ? <ReportToast message={toast} onDismiss={() => setToast(null)} /> : null}
    </div>
  );
}
