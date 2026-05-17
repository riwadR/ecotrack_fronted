"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Container } from "@/models/container";
import type { BackendContainerStatus } from "@/lib/containers/backendContainerStatus";
import { getContainers } from "@/services/api/containers";
import ContainerFillLevelBar from "@/components/containers/ContainerFillLevelBar";
import ContainerOperationalStatusBadge from "@/components/containers/ContainerOperationalStatusBadge";
import { getContainerTypeLabel } from "@/lib/containers/containerTypeLabels";
import {
  formatSensorTimestampFr,
  normalizeSensorTimestampToIso,
} from "@/lib/datetime/sensorTimestamp";
import DateRangeFilter from "@/components/ui/DateRangeFilter";
import type { CustomDateRangeInput } from "@/lib/dateFilter";
import {
  PAGE_DESCRIPTION_CLASS,
  PAGE_STACK_CLASS,
  PAGE_TITLE_CLASS,
} from "@/lib/ui/appChrome";

type StatusFilter = "tous" | BackendContainerStatus;

const FILTRES: StatusFilter[] = ["tous", "OK", "WARNING", "CRITICAL", "MAINTENANCE"];

function filterPillClass(active: boolean) {
  return active
    ? "border border-emerald-600 bg-emerald-600 text-white"
    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50";
}

function filterLabel(filter: StatusFilter): string {
  if (filter === "tous") {
    return "Tous";
  }
  if (filter === "OK") {
    return "OK";
  }
  if (filter === "WARNING") {
    return "Alerte";
  }
  if (filter === "CRITICAL") {
    return "Critique";
  }
  return "Maintenance";
}

function formatLastTelemetry(container: Container): string {
  const iso = normalizeSensorTimestampToIso(container.lastSensorUpdate);
  if (!iso) {
    return "—";
  }
  return formatSensorTimestampFr(iso, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function CapteursPageContent() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filtre, setFiltre] = useState<StatusFilter>("tous");
  const [dateRange, setDateRange] = useState<CustomDateRangeInput>({
    startDate: "",
    endDate: "",
  });

  const loadContainers = useCallback(async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const data = await getContainers({ dateRange });
      setContainers(data);
    } catch (error) {
      setContainers([]);
      setLoadError(
        error instanceof Error ? error.message : "Impossible de charger les capteurs."
      );
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    void loadContainers();
  }, [loadContainers]);

  const counts = useMemo(() => {
    const tally = { OK: 0, WARNING: 0, CRITICAL: 0, MAINTENANCE: 0 };
    for (const c of containers) {
      const status = c.operationalStatus ?? "OK";
      tally[status] += 1;
    }
    return tally;
  }, [containers]);

  const filtered = useMemo(() => {
    if (filtre === "tous") {
      return containers;
    }
    return containers.filter((c) => (c.operationalStatus ?? "OK") === filtre);
  }, [containers, filtre]);

  return (
    <div className={PAGE_STACK_CLASS}>
      <div>
        <h1 className={PAGE_TITLE_CLASS}>Capteurs</h1>
        <p className={PAGE_DESCRIPTION_CLASS}>
          {loading
            ? "Chargement des remontées IoT…"
            : `${counts.OK} OK · ${counts.WARNING} en alerte · ${counts.CRITICAL} critiques · ${counts.MAINTENANCE} en maintenance`}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total", value: containers.length, color: "#0ea5e9" },
          { label: "OK", value: counts.OK, color: "#16a34a" },
          { label: "Alerte", value: counts.WARNING, color: "#f97316" },
          { label: "Critique", value: counts.CRITICAL, color: "#ef4444" },
        ].map((k) => (
          <div
            key={k.label}
            className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm border-t-[3px]"
            style={{ borderTopColor: k.color }}
          >
            <p className="m-0 mb-1 text-2xl font-bold tabular-nums" style={{ color: k.color }}>
              {loading ? "—" : k.value}
            </p>
            <p className="m-0 text-xs text-slate-600">{k.label}</p>
          </div>
        ))}
      </div>

      <DateRangeFilter
        value={dateRange}
        onChange={setDateRange}
        disabled={loading}
      />

      <div className="flex flex-wrap gap-2">
        {FILTRES.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFiltre(f)}
            className={`min-h-10 rounded-full px-4 py-2 text-[13px] font-medium transition ${filterPillClass(filtre === f)}`}
          >
            {filterLabel(f)}
          </button>
        ))}
      </div>

      {loadError ? (
        <p className="m-0 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {loadError}
        </p>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md shadow-slate-200/40 sm:p-6">
        <div className="table-desktop hidden overflow-x-auto md:block">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2.5">N° Série</th>
                <th className="px-3 py-2.5">Type</th>
                <th className="px-3 py-2.5">Zone</th>
                <th className="px-3 py-2.5">Niveau de remplissage</th>
                <th className="px-3 py-2.5">Statut</th>
                <th className="px-3 py-2.5">Dernière remontée</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                    Chargement…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                    Aucun conteneur à afficher.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-3 py-3.5 font-mono font-semibold text-sky-700">
                      {c.serialNumber ?? c.id}
                    </td>
                    <td className="px-3 py-3.5 text-slate-800">
                      {getContainerTypeLabel(c.type)}
                    </td>
                    <td className="px-3 py-3.5 text-slate-700">{c.zoneName ?? "—"}</td>
                    <td className="px-3 py-3.5">
                      <ContainerFillLevelBar
                        fillLevel={c.fillLevel ?? 0}
                        operationalStatus={c.operationalStatus}
                      />
                    </td>
                    <td className="px-3 py-3.5">
                      <ContainerOperationalStatusBadge status={c.operationalStatus} />
                    </td>
                    <td className="px-3 py-3.5 text-[13px] text-slate-600">
                      {formatLastTelemetry(c)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="cards-mobile md:hidden">
          {loading ? (
            <p className="m-0 p-4 text-center text-sm text-slate-500">Chargement…</p>
          ) : filtered.length === 0 ? (
            <p className="m-0 p-4 text-center text-sm text-slate-500">Aucun conteneur à afficher.</p>
          ) : (
            filtered.map((c) => (
              <article key={c.id} className="border-b border-slate-100 p-4 last:border-0">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono font-bold text-sky-700">
                    {c.serialNumber ?? c.id}
                  </span>
                  <ContainerOperationalStatusBadge status={c.operationalStatus} />
                </div>
                <p className="m-0 text-sm font-medium text-slate-900">
                  {getContainerTypeLabel(c.type)} · {c.zoneName ?? "—"}
                </p>
                <div className="mt-3">
                  <ContainerFillLevelBar
                    fillLevel={c.fillLevel ?? 0}
                    operationalStatus={c.operationalStatus}
                  />
                </div>
                <p className="m-0 mt-2 text-xs text-slate-500">
                  Dernière remontée : {formatLastTelemetry(c)}
                </p>
              </article>
            ))
          )}
        </div>

        <p className="m-0 px-1 pt-3 text-[13px] text-slate-400">
          {filtered.length} conteneur{filtered.length > 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
