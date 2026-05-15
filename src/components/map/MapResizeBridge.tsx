"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

/**
 * Subscribes Leaflet to container `ResizeObserver` events.
 * Pairs well with `dvh`-based shells in `mapShellLayout` after mobile browser chrome shifts the viewport.
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
