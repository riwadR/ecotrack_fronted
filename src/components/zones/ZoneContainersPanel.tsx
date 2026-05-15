"use client";

import type { Container } from "@/models/container";
import type { Zone } from "@/models/zone";
import { containerDisplayName } from "@/lib/zones/zoneContainerUtils";
import { getContainerTypeLabel } from "@/lib/containers/containerTypeLabels";

export type ZoneContainersPanelProps = {
  zone: Zone | null;
  containers: Container[];
  isLoading: boolean;
  error: string | null;
  canManage: boolean;
  onClose: () => void;
  onEdit: (container: Container) => void;
  onDelete: (container: Container) => void;
};

export default function ZoneContainersPanel({
  zone,
  containers,
  isLoading,
  error,
  canManage,
  onClose,
  onEdit,
  onDelete,
}: ZoneContainersPanelProps) {
  if (!zone) {
    return null;
  }

  return (
  <>
      <button
        type="button"
        className="fixed inset-0 z-[1000] bg-slate-900/30"
        aria-label="Fermer la liste des conteneurs"
        onClick={onClose}
      />
      <aside
        className="fixed right-0 top-0 z-[1001] flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl"
        aria-labelledby="zone-containers-title"
      >
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <p className="m-0 text-xs font-semibold uppercase tracking-wide text-slate-500">Secteur</p>
            <h2 id="zone-containers-title" className="m-0 text-lg font-bold text-slate-900">
              {zone.name}
            </h2>
            <p className="m-0 mt-1 text-sm text-slate-600">
              {containers.length} conteneur{containers.length > 1 ? "s" : ""} dans cette zone
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            onClick={onClose}
          >
            Fermer
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isLoading ? (
            <p className="m-0 text-sm text-slate-500">Chargement des conteneurs…</p>
          ) : error ? (
            <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          ) : containers.length === 0 ? (
            <p className="m-0 text-sm text-slate-500">Aucun conteneur rattaché à ce secteur.</p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {containers.map((container) => (
                <li
                  key={container.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/80 p-4"
                >
                  <p className="m-0 font-mono text-sm font-bold text-slate-900">
                    {containerDisplayName(container)}
                  </p>
                  <p className="m-0 mt-1 text-xs text-slate-600">
                    Type : {getContainerTypeLabel(container.type ?? container.wasteType)}
                    {container.fillLevel != null ? ` · ${container.fillLevel} %` : ""}
                  </p>
                  {canManage ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                        onClick={() => onEdit(container)}
                      >
                        Renommer
                      </button>
                      <button
                        type="button"
                        className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                        onClick={() => onDelete(container)}
                      >
                        Supprimer
                      </button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
