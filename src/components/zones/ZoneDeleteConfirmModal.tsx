"use client";

import Link from "next/link";
import type { ZoneDeletionPreview } from "@/services/api/zones";
import {
  APP_MODAL_BODY_CLASS,
  APP_MODAL_FOOTER_CLASS,
  APP_MODAL_HEADER_CLASS,
  APP_MODAL_PANEL_CLASS,
  APP_MODAL_TITLE_CLASS,
  appModalBackdrop,
} from "@/lib/ui/appChrome";

export type ZoneDeleteConfirmModalProps = {
  isOpen: boolean;
  preview: ZoneDeletionPreview | null;
  isLoadingPreview: boolean;
  isDeleting: boolean;
  previewError: string | null;
  submitError: string | null;
  onConfirmCascade: () => void | Promise<void>;
  onCancel: () => void;
};

function SectionHeader({ children }: { children: string }) {
  return (
    <p className="m-0 text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </p>
  );
}

export default function ZoneDeleteConfirmModal({
  isOpen,
  preview,
  isLoadingPreview,
  isDeleting,
  previewError,
  submitError,
  onConfirmCascade,
  onCancel,
}: ZoneDeleteConfirmModalProps) {
  if (!isOpen) {
    return null;
  }

  const zoneLabel = preview?.zoneName ?? "cette zone";
  const hasLinkedData =
    preview !== null &&
    (preview.affectedChallengesCount > 0 ||
      preview.affectedToursCount > 0 ||
      preview.containerCount > 0 ||
      preview.reportCount > 0);

  return (
    <div
      className={appModalBackdrop("z-[1000]")}
      role="dialog"
      aria-modal="true"
      aria-labelledby="zone-delete-title"
      onClick={() => {
        if (!isDeleting) onCancel();
      }}
    >
      <div
        className={`${APP_MODAL_PANEL_CLASS} flex max-h-[min(92dvh,44rem)] flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={`${APP_MODAL_HEADER_CLASS} shrink-0`}>
          <h2 id="zone-delete-title" className={APP_MODAL_TITLE_CLASS}>
            Supprimer la zone « {zoneLabel} » ?
          </h2>
        </header>

        <div className={`${APP_MODAL_BODY_CLASS} min-h-0 flex-1 overflow-hidden text-xs sm:text-sm`}>
          {isLoadingPreview ? (
            <p className="m-0 text-slate-600">Analyse des éléments liés…</p>
          ) : null}

          {previewError ? (
            <p className="m-0 font-medium text-red-600" role="alert">
              {previewError}
            </p>
          ) : null}

          {submitError ? (
            <p
              className="m-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 font-medium text-red-800"
              role="alert"
            >
              {submitError}
            </p>
          ) : null}

          {!isLoadingPreview && preview && !hasLinkedData ? (
            <p className="m-0 text-slate-600">
              Aucun défi, tournée, conteneur ni signalement n&apos;est rattaché à cette zone. La
              suppression est définitive.
            </p>
          ) : null}

          {!isLoadingPreview && preview && hasLinkedData ? (
            <>
              <p className="m-0 text-slate-600">
                Cette zone contient des éléments liés. Vous pouvez les retirer manuellement avant de
                supprimer la zone, ou confirmer pour tout supprimer en une fois :
              </p>

              <ul className="m-0 grid gap-2 p-0 text-slate-700">
                {preview.containerCount > 0 ? (
                  <li>
                    <span className="font-semibold">{preview.containerCount}</span> conteneur
                    {preview.containerCount > 1 ? "s" : ""}
                  </li>
                ) : null}
                {preview.affectedChallengesCount > 0 ? (
                  <li>
                    <span className="font-semibold">{preview.affectedChallengesCount}</span> défi
                    {preview.affectedChallengesCount > 1 ? "s" : ""}
                  </li>
                ) : null}
                {preview.affectedToursCount > 0 ? (
                  <li>
                    <span className="font-semibold">{preview.affectedToursCount}</span> tournée
                    {preview.affectedToursCount > 1 ? "s" : ""}
                  </li>
                ) : null}
                {preview.reportCount > 0 ? (
                  <li>
                    <span className="font-semibold">{preview.reportCount}</span> signalement
                    {preview.reportCount > 1 ? "s" : ""} (liés aux conteneurs)
                  </li>
                ) : null}
              </ul>

              <div className="max-h-[50vh] space-y-6 overflow-y-auto pr-2">
                {preview.containers.length > 0 ? (
                  <section>
                    <SectionHeader>Conteneurs concernés</SectionHeader>
                    <ul className="mt-2 list-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">
                      {preview.containers.map((item) => (
                        <li key={item.id} className="py-1">
                          {item.serialNumber}
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {preview.affectedChallengesCount > 0 ? (
                  <section>
                    <SectionHeader>Défis concernés</SectionHeader>
                    <ul className="mt-2 list-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">
                      {preview.affectedChallenges.map((item) => (
                        <li key={item.id} className="py-1">
                          {item.title}
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {preview.affectedToursCount > 0 ? (
                  <section>
                    <SectionHeader>Tournées concernées</SectionHeader>
                    <ul className="mt-2 list-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">
                      {preview.affectedTours.map((item) => (
                        <li key={item.id} className="py-1">
                          {item.descriptor}
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </div>

              <p className="m-0 text-slate-600">
                Retirez d&apos;abord les objets référencés via{" "}
                <Link href="/dashboard/collectes" className="font-semibold text-emerald-700 underline">
                  Collectes
                </Link>
                , la page{" "}
                <Link href="/dashboard/challenges" className="font-semibold text-emerald-700 underline">
                  Défis
                </Link>{" "}
                ou les conteneurs de la zone, puis revenez supprimer la zone seule.
              </p>
            </>
          ) : null}
        </div>

        <footer className={`${APP_MODAL_FOOTER_CLASS} shrink-0`}>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 sm:px-4 sm:text-sm"
          >
            Annuler
          </button>
          {hasLinkedData ? (
            <button
              type="button"
              disabled={isDeleting || isLoadingPreview || previewError !== null}
              onClick={() => void onConfirmCascade()}
              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 sm:px-4 sm:text-sm"
            >
              {isDeleting ? "Suppression…" : "Supprimer tout en cascade"}
            </button>
          ) : (
            <button
              type="button"
              disabled={isDeleting || isLoadingPreview || previewError !== null}
              onClick={() => void onConfirmCascade()}
              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 sm:px-4 sm:text-sm"
            >
              {isDeleting ? "Suppression…" : "Confirmer la suppression"}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
