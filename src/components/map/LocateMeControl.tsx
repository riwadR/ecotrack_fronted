"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";

const LOCATE_ZOOM = 16;

const LOCATE_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" aria-hidden="true">
  <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>
  <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
  <circle cx="12" cy="12" r="8"/>
</svg>`;

/**
 * Leaflet control that pans/zooms to the user's position via the Geolocation API.
 */
export default function LocateMeControl() {
  const map = useMap();
  const controlRef = useRef<L.Control | null>(null);

  useEffect(() => {
    const LocateControl = L.Control.extend({
      onAdd() {
        const wrapper = L.DomUtil.create("motionless", "leaflet-control ecotrack-locate-wrapper");

        const button = L.DomUtil.create("button", "ecotrack-locate-control") as HTMLButtonElement;
        button.type = "button";
        button.title = "Me localiser";
        button.setAttribute("aria-label", "Me localiser sur la carte");
        button.innerHTML = `<span class="ecotrack-locate-control__icon">${LOCATE_ICON_SVG}</span><span>Me localiser</span>`;

        const handleClick = (event: Event) => {
          L.DomEvent.stopPropagation(event);
          L.DomEvent.preventDefault(event);

          if (!navigator.geolocation) {
            window.alert("La géolocalisation n'est pas disponible sur cet appareil.");
            return;
          }

          button.disabled = true;

          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              map.flyTo([latitude, longitude], LOCATE_ZOOM, { duration: 0.8 });
              button.disabled = false;
            },
            () => {
              window.alert(
                "Impossible d'obtenir votre position. Vérifiez les autorisations de localisation."
              );
              button.disabled = false;
            },
            { enableHighAccuracy: true, timeout: 12_000, maximumAge: 0 }
          );
        };

        L.DomEvent.on(button, "click", handleClick);
        L.DomEvent.disableClickPropagation(wrapper);
        wrapper.appendChild(button);

        return wrapper;
      },
    });

    const control = new LocateControl({ position: "topright" });
    control.addTo(map);
    controlRef.current = control;

    return () => {
      control.remove();
      controlRef.current = null;
    };
  }, [map]);

  return null;
}
