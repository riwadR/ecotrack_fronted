"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import LocateMeControl from "@/components/map/LocateMeControl";
import UserLocationLayer from "@/components/map/UserLocationLayer";
import { useUserGeolocation } from "@/contexts/UserGeolocationContext";

const LOCATE_ZOOM = 16;

export type MapLocateMeKitProps = {
  compact?: boolean;
};

/**
 * Locate-me control bound to dashboard-level geolocation state (survives polling re-renders).
 */
export default function MapLocateMeKit({ compact = false }: MapLocateMeKitProps) {
  const map = useMap();
  const { tracking, fix, error, toggleTracking } = useUserGeolocation();
  const hasCenteredRef = useRef(false);

  useEffect(() => {
    if (!tracking) {
      hasCenteredRef.current = false;
      return;
    }
    if (!fix || hasCenteredRef.current) {
      return;
    }
    hasCenteredRef.current = true;
    map.flyTo([fix.latitude, fix.longitude], LOCATE_ZOOM, { duration: 0.8 });
  }, [fix, map, tracking]);

  return (
    <>
      <LocateMeControl
        compact={compact}
        active={tracking}
        onToggle={toggleTracking}
        errorMessage={error}
      />
      {tracking && fix ? <UserLocationLayer fix={fix} /> : null}
    </>
  );
}
