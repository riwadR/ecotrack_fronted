"use client";

import { useEffect } from "react";
import { useMap, useMapEvents } from "react-leaflet";

export type InfrastructureMapClickCaptureProps = {
  enabled: boolean;
  cursorClass: "ecotrack-map--add-container" | "ecotrack-map--relocate-container";
  onMapClick: (latitude: number, longitude: number) => void;
};

/**
 * Captures map clicks for container placement or relocation (mobile-friendly).
 */
export default function InfrastructureMapClickCapture({
  enabled,
  cursorClass,
  onMapClick,
}: InfrastructureMapClickCaptureProps) {
  const map = useMap();

  useMapEvents({
    click(event) {
      if (!enabled) {
        return;
      }
      onMapClick(event.latlng.lat, event.latlng.lng);
    },
  });

  useEffect(() => {
    const container = map.getContainer();
    const classes = ["ecotrack-map--add-container", "ecotrack-map--relocate-container"];
    if (enabled) {
      classes.forEach((name) => container.classList.remove(name));
      container.classList.add(cursorClass);
    } else {
      classes.forEach((name) => container.classList.remove(name));
    }
    return () => {
      classes.forEach((name) => container.classList.remove(name));
    };
  }, [cursorClass, enabled, map]);

  return null;
}
