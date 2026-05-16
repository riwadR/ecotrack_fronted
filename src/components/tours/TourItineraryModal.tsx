"use client";

import { useEffect, useId, useState } from "react";
import type { TourResponseDTO, TourStepDTO } from "@/models/tour";
import { formatTourDistance, formatTourDuration, shortTourId } from "@/lib/tours/tourDisplay";
import {
  APP_MODAL_BODY_CLASS,
  APP_MODAL_FOOTER_CLASS,
  APP_MODAL_HEADER_CLASS,
  APP_MODAL_PANEL_CLASS,
  APP_MODAL_SUBTITLE_CLASS,
  APP_MODAL_TITLE_CLASS,
  appModalBackdrop,
} from "@/lib/ui/appChrome";
import { getTourById } from "@/services/api/tourApi";

export type TourItineraryModalProps = {
  tourId: string | null;
  isOpen: boolean;
  onClose: () => void;
};

function sortSteps(steps: TourStepDTO[]): TourStepDTO[] {
  return [...steps].sort((a, b) => a.stepOrder - b.stepOrder);
}

export default function TourItineraryModal({ tourId, isOpen, onClose }: TourItineraryModalProps) {
  const titleId = useId();
  const [tour, setTour] = useState<TourResponseDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !tourId) {
      setTour(null);
      setError(null);
      return;
    }

    let cancelled = false;
    async function load() {
      if (!tourId) {
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await getTourById(tourId);
        if (!cancelled) {
          setTour(data);
        }
      } catch (err) {
        if (!cancelled) {
          setTour(null);
          setError(
            err instanceof Error ? err.message : "Impossible de charger l'itinéraire."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [isOpen, tourId]);

  if (!isOpen) {
    return null;
  }

  const steps = tour ? sortSteps(tour.steps) : [];

  return (
    <div
      className={appModalBackdrop("z-[1100]")}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div className={APP_MODAL_PANEL_CLASS} onClick={(e) => e.stopPropagation()}>
        <header className={APP_MODAL_HEADER_CLASS}>
          <h2 id={titleId} className={APP_MODAL_TITLE_CLASS}>
            Détails de l&apos;itinéraire
          </h2>
          {tour ? (
            <p className={APP_MODAL_SUBTITLE_CLASS}>
              Tournée {shortTourId(tour.id)} · {tour.zone.name} ·{" "}
              {formatTourDistance(tour.totalDistanceKm)} ·{" "}
              {formatTourDuration(tour.estimatedDurationMinutes)}
            </p>
          ) : null}
        </header>

        <div className={`${APP_MODAL_BODY_CLASS} min-h-0 flex-1 overflow-y-auto`}>
          {loading ? (
            <p className="m-0 text-sm text-slate-500">Chargement de l&apos;itinéraire…</p>
          ) : error ? (
            <p className="m-0 text-sm font-medium text-red-600" role="alert">
              {error}
            </p>
          ) : steps.length === 0 ? (
            <p className="m-0 text-sm text-slate-500">Aucune étape enregistrée pour cette tournée.</p>
          ) : (
            <ol className="m-0 list-none space-y-0 p-0">
              {steps.map((step, index) => (
                <li key={step.id} className="relative flex gap-3 pb-6 last:pb-0">
                  {index < steps.length - 1 ? (
                    <span
                      className="absolute left-[1.125rem] top-9 bottom-0 w-0.5 bg-emerald-200"
                      aria-hidden
                    />
                  ) : null}
                  <span className="relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                    {step.stepOrder}
                  </span>
                  <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5">
                    <p className="m-0 text-sm font-semibold text-slate-900">
                      Étape {step.stepOrder} : conteneur {step.serialNumber}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        <footer className={APP_MODAL_FOOTER_CLASS}>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto"
          >
            Fermer
          </button>
        </footer>
      </div>
    </div>
  );
}
