"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";

const LOCATE_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" aria-hidden="true">
  <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>
  <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
  <circle cx="12" cy="12" r="8"/>
</svg>`;

export type LocateMeControlProps = {
  compact?: boolean;
  active: boolean;
  onToggle: () => void;
  errorMessage?: string | null;
};

/**
 * Leaflet control — toggles live geolocation tracking via {@link MapLocateMeKit}.
 */
export default function LocateMeControl({
  compact = false,
  active,
  onToggle,
  errorMessage = null,
}: LocateMeControlProps) {
  const map = useMap();
  const controlRef = useRef<L.Control | null>(null);
  const onToggleRef = useRef(onToggle);
  const activeRef = useRef(active);
  const errorRef = useRef(errorMessage);

  useEffect(() => {
    onToggleRef.current = onToggle;
  }, [onToggle]);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    errorRef.current = errorMessage;
    if (errorMessage) {
      window.alert(errorMessage);
    }
  }, [errorMessage]);

  useEffect(() => {
    const LocateControl = L.Control.extend({
      onAdd() {
        const wrapper = L.DomUtil.create("div", "leaflet-control ecotrack-locate-wrapper");

        const buttonClasses = [
          "ecotrack-locate-control",
          "ecotrack-locate-control--round",
          compact ? "ecotrack-locate-control--compact" : "",
          activeRef.current ? "ecotrack-locate-control--active" : "",
        ]
          .filter(Boolean)
          .join(" ");

        const button = L.DomUtil.create("button", buttonClasses) as HTMLButtonElement;
        button.type = "button";
        button.title = "Me localiser";
        button.setAttribute("aria-label", "Me localiser sur la carte");
        button.setAttribute("aria-pressed", activeRef.current ? "true" : "false");
        button.innerHTML = `<span class="ecotrack-locate-control__icon">${LOCATE_ICON_SVG}</span><span class="ecotrack-locate-control__label">Me localiser</span>`;

        const handleClick = (event: Event) => {
          L.DomEvent.stopPropagation(event);
          L.DomEvent.preventDefault(event);

          if (!navigator.geolocation) {
            window.alert("La géolocalisation n'est pas disponible sur cet appareil.");
            return;
          }

          onToggleRef.current();
        };

        L.DomEvent.on(button, "click", handleClick);
        L.DomEvent.disableClickPropagation(wrapper);
        wrapper.appendChild(button);

        (wrapper as HTMLElement & { _locateButton?: HTMLButtonElement })._locateButton = button;

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
  }, [compact, map]);

  useEffect(() => {
    const container = controlRef.current?.getContainer() as
      | (HTMLElement & { _locateButton?: HTMLButtonElement })
      | undefined;
    const button = container?._locateButton;
    if (!button) {
      return;
    }
    button.classList.toggle("ecotrack-locate-control--active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  }, [active]);

  return null;
}
