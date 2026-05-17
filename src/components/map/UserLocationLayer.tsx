"use client";

import { Circle, Marker } from "react-leaflet";
import type { GeolocationFix } from "@/hooks/useGeolocationWatch";
import { buildUserLocationMarkerIcon } from "@/lib/map/userLocationMarkerIcon";

const ACCURACY_CIRCLE_OPTIONS = {
  color: "#3b82f6",
  weight: 1,
  fillColor: "#60a5fa",
  fillOpacity: 0.18,
} as const;

export type UserLocationLayerProps = {
  fix: GeolocationFix;
};

export default function UserLocationLayer({ fix }: UserLocationLayerProps) {
  const position: [number, number] = [fix.latitude, fix.longitude];

  return (
    <>
      <Circle
        center={position}
        radius={fix.accuracy}
        pathOptions={ACCURACY_CIRCLE_OPTIONS}
      />
      <Marker
        position={position}
        icon={buildUserLocationMarkerIcon()}
        zIndexOffset={900}
      />
    </>
  );
}
