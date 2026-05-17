import L from "leaflet";

/** Pulsing blue GPS dot for the user's live position. */
export function buildUserLocationMarkerIcon(): L.DivIcon {
  return L.divIcon({
    className: "ecotrack-user-location-marker",
    html: '<span class="ecotrack-user-location-marker__pulse" aria-hidden="true"></span><span class="ecotrack-user-location-marker__dot" aria-hidden="true"></span>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}
