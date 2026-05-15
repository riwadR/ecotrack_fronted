/** Ring vertex: [latitude, longitude] (aligned with Leaflet / `ZonePolygonLayer.positions`). */
export type LatLngRing = [number, number][];

export type PolygonWithId = {
  id: string;
  positions: LatLngRing;
};

/**
 * Ray-casting point-in-polygon (WGS84 lat/lng ring, no antimeridian handling).
 */
export function isPointInPolygonRing(lat: number, lng: number, ring: LatLngRing): boolean {
  if (!ring || ring.length < 3) {
    return false;
  }

  let inside = false;
  const n = ring.length;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const latI = ring[i][0];
    const lngI = ring[i][1];
    const latJ = ring[j][0];
    const lngJ = ring[j][1];

    const crossesLat = latI > lat !== latJ > lat;
    if (!crossesLat) {
      continue;
    }

    const lngAtCrossing =
      lngJ === lngI ? lngI : lngJ + ((lngI - lngJ) * (lat - latJ)) / (latI - latJ);
    if (lng < lngAtCrossing) {
      inside = !inside;
    }
  }

  return inside;
}

/** First polygon in list order that contains the point. */
export function findZoneIdContainingPoint(
  lat: number,
  lng: number,
  polygons: PolygonWithId[]
): string | undefined {
  for (const layer of polygons) {
    if (!layer.positions?.length) {
      continue;
    }
    if (isPointInPolygonRing(lat, lng, layer.positions)) {
      return layer.id;
    }
  }
  return undefined;
}
