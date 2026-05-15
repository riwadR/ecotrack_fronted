"use client";

import type { Container } from "@/models/map";

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Actif",
  INACTIVE: "Inactif",
  WARNING: "Alerte",
  CRITICAL: "Critique",
};

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
  const statusLabel = container.status
    ? STATUS_LABELS[container.status] ?? container.status
    : "—";

  const lastMeasuredLabel = new Date(container.lastMeasurementAt).toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <aside
      className="fixed inset-y-0 right-0 z-[1000] flex w-full max-w-sm flex-col border-l border-slate-200 bg-white shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="container-drawer-title"
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h2 id="container-drawer-title" className="text-base font-semibold text-slate-900">
          Détail du conteneur
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
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

      <div className="border-t border-slate-100 p-4">
        <button
          type="button"
          className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          onClick={() => onReport(container.id)}
        >
          Signaler un problème
        </button>
      </div>
    </aside>
  );
}
