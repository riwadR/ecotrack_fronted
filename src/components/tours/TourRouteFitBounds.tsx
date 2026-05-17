"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";
import { tourRoutePositionsKey, type LatLngTuple } from "@/lib/tours/tourRouteMap";

export type TourRouteFitBoundsProps = {
  positions: LatLngTuple[];
};

/** Frames the map on the tour route once per distinct coordinate set (ignores array reference churn). */
export default function TourRouteFitBounds({ positions }: TourRouteFitBoundsProps) {
  const map = useMap();
  const lastFittedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (positions.length === 0) {
      return;
    }

    const positionsKey = tourRoutePositionsKey(positions);
    if (lastFittedKeyRef.current === positionsKey) {
      return;
    }
    lastFittedKeyRef.current = positionsKey;

    const timer = window.setTimeout(() => {
      map.invalidateSize({ animate: false });

      if (positions.length === 1) {
        map.setView(positions[0], 15);
        return;
      }

      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50] });
    }, 100);

    return () => window.clearTimeout(timer);
  }, [map, positions]);

  return null;
}
