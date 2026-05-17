"use client";

import { useMemo } from "react";
import { Marker, Popup } from "react-leaflet";
import { buildTourLiveAgentMarkerIcon } from "@/lib/tours/tourLiveAgentMarkerIcon";
import type { TourLiveAgentPosition } from "@/lib/tours/tourLiveAgent";

export type TourLiveAgentMarkerProps = {
  agent: TourLiveAgentPosition;
};

export default function TourLiveAgentMarker({ agent }: TourLiveAgentMarkerProps) {
  const icon = useMemo(
    () => buildTourLiveAgentMarkerIcon(agent.label),
    [agent.label]
  );

  return (
    <Marker
      position={[agent.latitude, agent.longitude]}
      icon={icon}
      zIndexOffset={1100}
    >
      <Popup>
        <p className="m-0 text-sm font-semibold text-slate-900">
          Position de l&apos;agent · {agent.label}
        </p>
      </Popup>
    </Marker>
  );
}
