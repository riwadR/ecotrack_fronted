"use client";

import { useEffect, useMemo, useRef } from "react";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import { Marker } from "react-leaflet";
import { buildZoneLabelIcon } from "@/lib/map/zoneLabelIcon";
import { getZoneLabelPosition } from "@/lib/map/zoneLabelPosition";

export type ZoneNameLabelProps = {
  name: string;
  polygon: [number, number][];
};

function polygonCoordsKey(polygon: [number, number][]): string {
  return polygon.map(([lat, lng]) => `${lat.toFixed(6)},${lng.toFixed(6)}`).join(";");
}

/**
 * Permanent, non-interactive zone name placed along the top edge of the polygon.
 */
export default function ZoneNameLabel({ name, polygon }: ZoneNameLabelProps) {
  const polygonKey = useMemo(() => polygonCoordsKey(polygon), [polygon]);
  const position = useMemo(() => getZoneLabelPosition(polygon), [polygonKey]);
  const icon = useMemo(() => buildZoneLabelIcon(name), [name]);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (position) {
      markerRef.current?.setLatLng(position as LatLngExpression);
    }
  }, [position]);

  if (!position) {
    return null;
  }

  return (
    <Marker
      ref={markerRef}
      position={position}
      icon={icon}
      interactive={false}
      keyboard={false}
      zIndexOffset={-200}
    />
  );
}
