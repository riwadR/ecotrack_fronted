/**
 * Parses a simple `POLYGON((lon lat, ...))` WKT outer ring into Leaflet `[latitude, longitude]` vertices.
 * PostGIS / JTS `toString()` on polygons follows this pattern for SRID 4326-style geographic data.
 */
export function wktPolygonOuterRingToLatLngTuples(wkt: string): [number, number][] {
  const trimmed = wkt.trim();
  const upper = trimmed.toUpperCase();
  if (!upper.startsWith("POLYGON")) {
    return [];
  }

  const innerMatch = trimmed.match(/\(\s*\(\s*([^)]+)\s*\)\s*\)/);
  if (!innerMatch?.[1]) {
    return [];
  }

  const ring: [number, number][] = [];
  const pairs = innerMatch[1].split(",");

  for (const pair of pairs) {
    const parts = pair.trim().split(/\s+/).filter(Boolean);
    if (parts.length < 2) continue;
    const a = Number(parts[0]);
    const b = Number(parts[1]);
    if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
    // WKT order is (longitude, latitude); Leaflet expects [lat, lng].
    ring.push([b, a]);
  }

  return ring.length >= 3 ? ring : [];
}
