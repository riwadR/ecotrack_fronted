import L from "leaflet";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Non-interactive DivIcon for a zone name (pointer events disabled via CSS). */
export function buildZoneLabelIcon(name: string): L.DivIcon {
  return L.divIcon({
    className: "ecotrack-zone-label",
    html: `<span class="ecotrack-zone-label__text">${escapeHtml(name)}</span>`,
    iconSize: [1, 1],
    iconAnchor: [0, 0],
  });
}
