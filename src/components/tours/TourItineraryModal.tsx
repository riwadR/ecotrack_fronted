"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import type { TourResponseDTO } from "@/models/tour";
import {
  formatTourDistance,
  formatTourDuration,
  formatTourZones,
  shortTourId,
  TOUR_ESTIMATED_DURATION_HINT,
} from "@/lib/tours/tourDisplay";
import { resolveTourLiveAgent } from "@/lib/tours/tourLiveAgent";
import { sortTourSteps } from "@/lib/tours/tourRouteMap";
import { shouldShowPerformanceReport } from "@/lib/tours/tourPerformanceReport";
import {
  TOUR_EMBEDDED_PANEL_CLASS,
} from "@/lib/tours/tourEmbeddedShell";
import TourItineraryStepList from "@/components/tours/TourItineraryStepList";
import TourPerformanceReport from "@/components/tours/TourPerformanceReport";
import {
  APP_MODAL_FOOTER_CLASS,
  APP_MODAL_HEADER_CLASS,
  APP_MODAL_SUBTITLE_CLASS,
  APP_MODAL_TITLE_CLASS,
} from "@/lib/ui/appChrome";
import { getTourById } from "@/services/api/tourApi";

const TourItineraryMap = dynamic(() => import("@/components/tours/TourItineraryMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[220px] items-center justify-center bg-slate-50 text-sm text-slate-500">
      Chargement de la carte…
    </div>
  ),
});

const ITINERARY_POLL_MS = 15_000;

const ITINERARY_BODY_CLASS =
  "flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row lg:overflow-hidden";

export type TourItineraryModalProps = {
  tourId: string | null;
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
};

export default function TourItineraryModal({
  tourId,
  isOpen,
  onClose,
  embedded = false,
}: TourItineraryModalProps) {
  const titleId = useId();
  const [tour, setTour] = useState<TourResponseDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTour = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!tourId) {
        return;
      }
      const silent = options?.silent ?? false;
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      try {
        const data = await getTourById(tourId);
        setTour(data);
      } catch (err) {
        if (!silent) {
          setTour(null);
          setError(
            err instanceof Error ? err.message : "Impossible de charger l'itinéraire."
          );
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [tourId]
  );

  useEffect(() => {
    if (!isOpen || !tourId) {
      setTour(null);
      setError(null);
      return;
    }
    void loadTour();
  }, [isOpen, loadTour, tourId]);

  useEffect(() => {
    if (!isOpen || !tourId) {
      return;
    }
    const intervalId = window.setInterval(() => {
      void loadTour({ silent: true });
    }, ITINERARY_POLL_MS);
    return () => window.clearInterval(intervalId);
  }, [isOpen, loadTour, tourId]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const timer = window.setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 200);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const steps = tour ? sortTourSteps(tour.steps) : [];
  const liveAgent = useMemo(() => resolveTourLiveAgent(tour), [tour]);
  const showMap = !loading && !error && steps.length > 0;
  const showPerformance = tour != null && shouldShowPerformanceReport(tour);
  const modalTitle =
    tour?.status === "COMPLETED" ? "Compte rendu" : "Détails de l'itinéraire";

  const panel = (
    <div className={embedded ? TOUR_EMBEDDED_PANEL_CLASS : "flex max-h-[min(92dvh,44rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"}>
      <header className={`${APP_MODAL_HEADER_CLASS} shrink-0`}>
        <h2 id={titleId} className={APP_MODAL_TITLE_CLASS}>
          {modalTitle}
        </h2>
        {tour ? (
          <>
            <p className={APP_MODAL_SUBTITLE_CLASS}>
              Tournée {shortTourId(tour.id)} · {formatTourZones(tour)} ·{" "}
              {formatTourDistance(tour.totalDistanceKm)} ·{" "}
              {formatTourDuration(tour.estimatedDurationMinutes)}
            </p>
            <p className="m-0 mt-1 text-xs text-slate-500 lg:hidden">
              {TOUR_ESTIMATED_DURATION_HINT}
            </p>
          </>
        ) : null}
      </header>

      <div className={ITINERARY_BODY_CLASS}>
        <section
          className="flex h-[45vh] shrink-0 flex-col border-b border-slate-200 max-sm:h-[38vh] lg:h-auto lg:min-h-0 lg:flex-1 lg:basis-0 lg:border-b-0 lg:border-r"
          aria-label="Carte de l'itinéraire"
        >
          {loading ? (
            <p className="flex flex-1 items-center justify-center p-4 text-sm text-slate-500">
              Chargement de l&apos;itinéraire…
            </p>
          ) : error ? (
            <p className="m-4 text-sm font-medium text-red-600" role="alert">
              {error}
            </p>
          ) : showMap ? (
            <div className="flex h-full min-h-0 flex-col p-4 sm:p-6">
              <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
                <TourItineraryMap
                  steps={steps}
                  liveAgent={liveAgent}
                  className="h-full min-h-[220px] rounded-xl border-0"
                />
              </div>
            </div>
          ) : (
            <p className="flex flex-1 items-center justify-center p-4 text-sm text-slate-500">
              Aucune étape à afficher sur la carte.
            </p>
          )}
        </section>

        <section
          className="min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-5 sm:py-4 lg:w-[min(100%,22rem)] lg:shrink-0 xl:w-80"
          aria-label="Liste chronologique des étapes"
        >
          {loading ? null : error ? null : (
            <>
              {showPerformance && tour ? <TourPerformanceReport tour={tour} /> : null}
              <TourItineraryStepList steps={steps} showTimelineMetrics={showPerformance} />
            </>
          )}
        </section>
      </div>

      <footer className={APP_MODAL_FOOTER_CLASS}>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto"
        >
          {embedded ? "Retour à la liste" : "Fermer"}
        </button>
      </footer>
    </div>
  );

  if (embedded) {
    return panel;
  }

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>{panel}</div>
    </div>
  );
}
