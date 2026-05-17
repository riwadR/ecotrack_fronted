"use client";

import type { Container } from "@/models/map";
import { getContainerStatusLabel } from "@/lib/containers/containerOperationalStatus";
import { getContainerTypeLabel } from "@/lib/containers/containerTypeLabels";
import { parseBackendContainerStatus } from "@/lib/containers/backendContainerStatus";
import { formatSensorTimestampFr } from "@/lib/datetime/sensorTimestamp";

export type ContainerDetailsDrawerProps = {
  container: Container | null;
  onClose: () => void;
  onReport: (containerId: string) => void;
};

/**
 * Side panel with container summary and entry point to the report form.
 */
export default function ContainerDetailsDrawer({
  container,
  onClose,
  onReport,
}: ContainerDetailsDrawerProps) {
  if (!container) {
    return null;
  }

  const displaySerial = container.serialNumber ?? container.id;
  const statusLabel = getContainerStatusLabel(
    parseBackendContainerStatus(container.operationalStatus)
  );

  const lastMeasuredLabel = formatSensorTimestampFr(container.lastMeasurementAt);
  const containerTypeLabel = getContainerTypeLabel(container.containerType);

  return (
    <aside
      className="fixed inset-y-0 right-0 z-[1000] flex h-[100dvh] max-h-[100dvh] w-full max-w-full flex-col border-l border-slate-200 bg-white shadow-2xl sm:max-w-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="container-drawer-title"
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))]">
        <h2 id="container-drawer-title" className="text-base font-semibold text-slate-900">
          Détail du conteneur
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
          aria-label="Fermer le panneau"
        >
          ✕
        </button>
      </div>

      <section className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
        <div>
          <p className="m-0 text-xs font-semibold uppercase tracking-wide text-slate-500">
            N° de série
          </p>
          <p className="m-0 font-mono text-lg font-bold text-slate-900">{displaySerial}</p>
        </div>

        <dl className="m-0 grid gap-3 text-sm">
          <div>
            <dt className="font-medium text-slate-500">Type de conteneur</dt>
            <dd className="m-0 font-semibold text-slate-900">{containerTypeLabel}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Secteur</dt>
            <dd className="m-0 font-semibold text-slate-900">{container.zoneName ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Statut</dt>
            <dd className="m-0 font-semibold text-slate-900">{statusLabel}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Remplissage</dt>
            <dd className="m-0 font-semibold text-slate-900">{container.fillLevelPercent} %</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Dernière mesure</dt>
            <dd className="m-0 text-slate-900">{lastMeasuredLabel}</dd>
          </div>
        </dl>
      </section>

      <div className="border-t border-slate-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
        <button
          type="button"
          className="min-h-[48px] w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          onClick={() => onReport(container.id)}
        >
          Signaler un problème
        </button>
      </div>
    </aside>
  );
}
