"use client";

import { useEffect, useRef } from "react";
import type { TourResponseDTO } from "@/models/tour";
import { updateTourTelemetry } from "@/services/api/tourApi";

const TELEMETRY_INTERVAL_MS = 15_000;

/**
 * Silently posts the agent's GPS position every 15s while a tour is IN_PROGRESS.
 */
export function useAgentTourTelemetry(tour: TourResponseDTO | null): void {
  const tourId = tour?.status === "IN_PROGRESS" ? tour.id : null;
  const latestCoordsRef = useRef<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (!tourId) {
      latestCoordsRef.current = null;
      return;
    }

    if (!navigator.geolocation) {
      return;
    }

    const postTelemetry = () => {
      const coords = latestCoordsRef.current;
      if (!coords) {
        return;
      }
      void updateTourTelemetry(tourId, coords).catch(() => {
        /* Background loop — no UI noise on transient failures. */
      });
    };

    let hasPostedInitialFix = false;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        latestCoordsRef.current = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        if (!hasPostedInitialFix) {
          hasPostedInitialFix = true;
          postTelemetry();
        }
      },
      () => {
        /* Permission errors are handled by the locate-me control if the agent opens the map. */
      },
      { enableHighAccuracy: true, maximumAge: 5_000, timeout: 12_000 }
    );

    postTelemetry();
    const intervalId = window.setInterval(postTelemetry, TELEMETRY_INTERVAL_MS);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      window.clearInterval(intervalId);
      latestCoordsRef.current = null;
    };
  }, [tourId]);
}
