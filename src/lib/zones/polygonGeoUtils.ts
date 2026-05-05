import type { LatLng, Polygon } from "leaflet";

/**
 * Returns the outer ring of a Leaflet polygon as `[latitude, longitude]` pairs.
 */
export function getPolygonOuterRingLatLng(layer: Polygon): [number, number][] {
  const latlngs = layer.getLatLngs() as LatLng[] | LatLng[][];
  const outerRing = Array.isArray(latlngs[0]) ? (latlngs as LatLng[][])[0] : (latlngs as LatLng[]);
  return outerRing.map((ll) => [ll.lat, ll.lng] as [number, number]);
}
