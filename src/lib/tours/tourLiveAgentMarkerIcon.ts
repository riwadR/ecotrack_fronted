import L from "leaflet";

export function buildTourLiveAgentMarkerIcon(label: string): L.DivIcon {
  const safeLabel = label
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  return L.divIcon({
    className: "ecotrack-live-agent-marker",
    html: `<span class="ecotrack-live-agent-marker__pin" aria-hidden="true">🚛</span><span class="ecotrack-live-agent-marker__label">${safeLabel}</span>`,
    iconSize: [40, 48],
    iconAnchor: [20, 44],
  });
}
