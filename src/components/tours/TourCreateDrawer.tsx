"use client";

import TourCreateForm from "@/components/tours/TourCreateForm";
import type { TourResponseDTO } from "@/models/tour";
import {
  APP_MODAL_SUBTITLE_CLASS,
  APP_MODAL_TITLE_CLASS,
} from "@/lib/ui/appChrome";

export type TourCreateDrawerProps = {
  isOpen: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onSuccess: (tour: TourResponseDTO) => void;
  onError: (message: string) => void;
};

export default function TourCreateDrawer({
  isOpen,
  onClose,
  onSuccess,
  onError,
}: TourCreateDrawerProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[1000] bg-slate-900/40"
        aria-label="Fermer"
        onClick={onClose}
      />
      <aside
        className="fixed inset-y-0 right-0 z-[1001] flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-create-drawer-title"
      >
        <header className="shrink-0 border-b border-slate-200 px-4 py-4 sm:px-5">
          <h2 id="tour-create-drawer-title" className={APP_MODAL_TITLE_CLASS}>
            Nouvelle tournée
          </h2>
          <p className={APP_MODAL_SUBTITLE_CLASS}>
            Planifiez un itinéraire optimisé pour vos agents de collecte.
          </p>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-5">
          <TourCreateForm
            showIntro={false}
            onSuccess={(tour) => {
              onSuccess(tour);
              onClose();
            }}
            onError={onError}
          />
        </div>
      </aside>
    </>
  );
}
