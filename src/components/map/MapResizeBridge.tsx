"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

/**
 * Keeps the Leaflet map in sync when its container is resized (flex layouts, dynamic panels).
 */
export default function MapResizeBridge() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const observer = new ResizeObserver(() => {
      map.invalidateSize({ animate: false });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);

  return null;
}
