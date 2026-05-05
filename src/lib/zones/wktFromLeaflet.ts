/**
 * Builds an OGC WKT POLYGON string from a closed ring in Leaflet order `[latitude, longitude]`.
 * WKT coordinate pairs use `longitude latitude` (x y) order per OGC conventions.
 */
export function latLngRingToPolygonWkt(ring: [number, number][]): string {
  if (ring.length < 3) {
    throw new Error("A polygon ring must contain at least three distinct vertices.");
  }

  const closedRing: [number, number][] = [...ring];
  const [firstLat, firstLng] = closedRing[0]!;
  const [lastLat, lastLng] = closedRing[closedRing.length - 1]!;
  if (firstLat !== lastLat || firstLng !== lastLng) {
    closedRing.push([firstLat, firstLng]);
  }

  const coordinatePairs = closedRing.map(([lat, lng]) => `${lng} ${lat}`).join(", ");
  return `POLYGON ((${coordinatePairs}))`;
}
