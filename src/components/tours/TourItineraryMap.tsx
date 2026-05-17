"use client";

import "leaflet/dist/leaflet.css";
import { useMemo } from "react";
import { MapContainer, Polyline, TileLayer } from "react-leaflet";
import type { TourStepDTO } from "@/models/tour";
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
} from "@/components/map/InteractiveMap";
import MapLocateMeKit from "@/components/map/MapLocateMeKit";
import MapResizeBridge from "@/components/map/MapResizeBridge";
import TourLiveAgentMarker from "@/components/tours/TourLiveAgentMarker";
import type { TourLiveAgentPosition } from "@/lib/tours/tourLiveAgent";
import TourItineraryStepMarker from "@/components/tours/TourItineraryStepMarker";
import TourRouteFitBounds from "@/components/tours/TourRouteFitBounds";
import {
  findFirstPendingStep,
  sortTourSteps,
  tourPendingStepsToRouteCoordinates,
  tourStepsToRouteCoordinates,
} from "@/lib/tours/tourRouteMap";

const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const ROUTE_POLYLINE_OPTIONS = {
  color: "#3b82f6",
  weight: 4,
  dashArray: "10, 10",
} as const;

export type TourItineraryMapProps = {
  steps: TourStepDTO[];
  /** Optional classes for the outer map frame (e.g. agent `h-[40vh]`). */
  className?: string;
  /** When true, numbered markers are hidden for completed steps (agent execution). */
  hideCompletedMarkers?: boolean;
  /** Live GPS position of the assigned agent (manager view). */
  liveAgent?: TourLiveAgentPosition | null;
};

export default function TourItineraryMap({
  steps,
  className,
  hideCompletedMarkers = false,
  liveAgent = null,
}: TourItineraryMapProps) {
  const orderedSteps = useMemo(() => sortTourSteps(steps), [steps]);
  const markerSteps = useMemo(
    () =>
      hideCompletedMarkers
        ? orderedSteps.filter((step) => step.status === "PENDING")
        : orderedSteps,
    [hideCompletedMarkers, orderedSteps]
  );
  const nextTargetStepId = useMemo(
    () => (hideCompletedMarkers ? findFirstPendingStep(steps)?.id : null),
    [hideCompletedMarkers, steps]
  );

  const routeCoordinates = useMemo(
    () =>
      hideCompletedMarkers
        ? tourPendingStepsToRouteCoordinates(steps)
        : tourStepsToRouteCoordinates(steps),
    [hideCompletedMarkers, steps]
  );

  const mapCenter = routeCoordinates[0] ?? DEFAULT_MAP_CENTER;
  const mapZoom = routeCoordinates.length > 0 ? DEFAULT_MAP_ZOOM : 12;

  const frameClass = [
    "relative h-full min-h-[220px] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={frameClass}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className={
          "h-full min-h-[220px] w-full [&_.ecotrack-locate-wrapper]:mr-[max(0.75rem,env(safe-area-inset-right))] " +
          "[&_.ecotrack-locate-wrapper]:mt-[max(0.75rem,env(safe-area-inset-top))] [&_.leaflet-control-attribution]:text-[10px]"
        }
        scrollWheelZoom
      >
        <MapResizeBridge />
        <MapLocateMeKit compact />
        <TourRouteFitBounds positions={routeCoordinates} />
        <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />
        {routeCoordinates.length >= 2 ? (
          <Polyline positions={routeCoordinates} pathOptions={ROUTE_POLYLINE_OPTIONS} />
        ) : null}
        {liveAgent ? <TourLiveAgentMarker agent={liveAgent} /> : null}
        {markerSteps.map((step) => (
          <TourItineraryStepMarker
            key={step.id}
            step={step}
            isNextTarget={step.id === nextTargetStepId}
          />
        ))}
      </MapContainer>
    </div>
  );
}
