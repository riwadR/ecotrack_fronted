import L from "leaflet";

const MARKER_SIZE_PX = 36;

export function buildTourStepMarkerIcon(
  stepOrder: number,
  isNextTarget = false
): L.DivIcon {
  const markerClass = isNextTarget
    ? "ecotrack-tour-step-marker ecotrack-tour-step-marker--next"
    : "ecotrack-tour-step-marker";

  return L.divIcon({
    className: "ecotrack-map-marker",
    html: `<span class="${markerClass}">${stepOrder}</span>`,
    iconSize: [MARKER_SIZE_PX, MARKER_SIZE_PX],
    iconAnchor: [MARKER_SIZE_PX / 2, MARKER_SIZE_PX / 2],
    popupAnchor: [0, -MARKER_SIZE_PX / 2],
  });
}
