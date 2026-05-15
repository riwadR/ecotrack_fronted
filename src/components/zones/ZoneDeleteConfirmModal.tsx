"use client";

import Link from "next/link";
import type { ZoneDeletionPreview } from "@/services/api/zones";

export type ZoneDeleteConfirmModalProps = {
  isOpen: boolean;
  preview: ZoneDeletionPreview | null;
  isLoadingPreview: boolean;
  isDeleting: boolean;
  previewError: string | null;
  onConfirmCascade: () => void | Promise<void>;
  onCancel: () => void;
};

export default function ZoneDeleteConfirmModal({
  isOpen,
  preview,
  isLoadingPreview,
  isDeleting,
  previewError,
  onConfirmCascade,
  onCancel,
}: ZoneDeleteConfirmModalProps) {
  if (!isOpen) {
    return null;
  }

  const zoneLabel = preview?.zoneName ?? "cette zone";
  const hasLinkedData =
    preview !== null &&
    (preview.challengeCount > 0 ||
      preview.containerCount > 0 ||
      preview.reportCount > 0);

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="zone-delete-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h2 id="zone-delete-title" className="text-lg font-semibold text-slate-900">
          Supprimer la zone « {zoneLabel} » ?
        </h2>

        {isLoadingPreview ? (
          <p className="mt-3 text-sm text-slate-600">Analyse des éléments liés…</p>
        ) : null}

        {previewError ? (
          <p className="mt-3 text-sm font-medium text-red-600" role="alert">
            {previewError}
          </p>
        ) : null}

        {!isLoadingPreview && preview && !hasLinkedData ? (
          <p className="mt-3 text-sm text-slate-600">
            Aucun défi, conteneur ni signalement n&apos;est rattaché à cette zone. La suppression
            est définitive.
          </p>
        ) : null}

        {!isLoadingPreview && preview && hasLinkedData ? (
          <>
            <p className="mt-3 text-sm text-slate-600">
              Cette zone contient des éléments liés. Vous pouvez les retirer manuellement avant de
              supprimer la zone, ou confirmer pour tout supprimer en une fois :
            </p>

            <ul className="mt-4 grid gap-2 text-sm text-slate-700">
              {preview.challengeCount > 0 ? (
                <li>
                  <span className="font-semibold">{preview.challengeCount}</span> défi
                  {preview.challengeCount > 1 ? "s" : ""}
                </li>
              ) : null}
              {preview.containerCount > 0 ? (
                <li>
                  <span className="font-semibold">{preview.containerCount}</span> conteneur
                  {preview.containerCount > 1 ? "s" : ""}
                </li>
              ) : null}
              {preview.reportCount > 0 ? (
                <li>
                  <span className="font-semibold">{preview.reportCount}</span> signalement
                  {preview.reportCount > 1 ? "s" : ""} (liés aux conteneurs)
                </li>
              ) : null}
            </ul>

            {preview.challenges.length > 0 ? (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Défis concernés
                </p>
                <ul className="mt-1 max-h-28 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  {preview.challenges.map((item) => (
                    <li key={item.id}>{item.title}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {preview.containers.length > 0 ? (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Conteneurs concernés
                </p>
                <ul className="mt-1 max-h-28 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  {preview.containers.map((item) => (
                    <li key={item.id}>{item.serialNumber}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <p className="mt-4 text-sm text-slate-600">
              Retirez d&apos;abord les objets référencés via la page{" "}
              <Link href="/dashboard/challenges" className="font-semibold text-emerald-700 underline">
                Défis
              </Link>{" "}
              ou les conteneurs de la zone, puis revenez supprimer la zone seule.
            </p>
          </>
        ) : null}

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Annuler
          </button>
          {hasLinkedData ? (
            <button
              type="button"
              disabled={isDeleting || isLoadingPreview || previewError !== null}
              onClick={() => void onConfirmCascade()}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? "Suppression…" : "Supprimer tout en cascade"}
            </button>
          ) : (
            <button
              type="button"
              disabled={isDeleting || isLoadingPreview || previewError !== null}
              onClick={() => void onConfirmCascade()}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? "Suppression…" : "Confirmer la suppression"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
