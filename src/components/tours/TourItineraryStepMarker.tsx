"use client";

import { useMemo } from "react";
import { Marker, Popup } from "react-leaflet";
import type { TourStepDTO } from "@/models/tour";
import { buildTourStepMarkerIcon } from "@/lib/tours/tourStepMarkerIcon";
import { hasStepCoordinates } from "@/lib/tours/tourRouteMap";

export type TourItineraryStepMarkerProps = {
  step: TourStepDTO;
  isNextTarget?: boolean;
};

export default function TourItineraryStepMarker({
  step,
  isNextTarget = false,
}: TourItineraryStepMarkerProps) {
  const icon = useMemo(
    () => buildTourStepMarkerIcon(step.stepOrder, isNextTarget),
    [isNextTarget, step.stepOrder]
  );

  if (!hasStepCoordinates(step)) {
    return null;
  }

  return (
    <Marker position={[step.latitude, step.longitude]} icon={icon}>
      <Popup>
        <div className="min-w-0 text-sm text-slate-800">
          <p className="m-0 font-semibold text-slate-900">
            Étape {step.stepOrder} : {step.serialNumber}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}
