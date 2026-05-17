"use client";

import { useEffect, useRef, useState } from "react";

export type GeolocationFix = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

export type UseGeolocationWatchOptions = {
  enabled: boolean;
  onFirstFix?: (fix: GeolocationFix) => void;
};

export type UseGeolocationWatchResult = {
  fix: GeolocationFix | null;
  error: string | null;
};

/**
 * Wraps {@link navigator.geolocation.watchPosition} with cleanup on disable/unmount.
 */
export function useGeolocationWatch({
  enabled,
  onFirstFix,
}: UseGeolocationWatchOptions): UseGeolocationWatchResult {
  const [fix, setFix] = useState<GeolocationFix | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasNotifiedFirstFixRef = useRef(false);
  const onFirstFixRef = useRef(onFirstFix);

  useEffect(() => {
    onFirstFixRef.current = onFirstFix;
  }, [onFirstFix]);

  useEffect(() => {
    if (!enabled) {
      setFix(null);
      setError(null);
      hasNotifiedFirstFixRef.current = false;
      return;
    }

    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas disponible sur cet appareil.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const nextFix: GeolocationFix = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.max(position.coords.accuracy, 8),
        };
        setFix(nextFix);
        setError(null);

        if (!hasNotifiedFirstFixRef.current) {
          hasNotifiedFirstFixRef.current = true;
          onFirstFixRef.current?.(nextFix);
        }
      },
      () => {
        setError(
          "Impossible d'obtenir votre position. Vérifiez les autorisations de localisation."
        );
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 5_000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [enabled]);

  return { fix, error };
}
