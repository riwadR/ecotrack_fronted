/**
 * Anchor for a zone name label: top edge center of the polygon bounding box,
 * slightly inset so the label sits just inside the northern boundary.
 */
export function getZoneLabelPosition(polygon: [number, number][]): [number, number] | null {
  if (polygon.length === 0) {
    return null;
  }

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const [lat, lng] of polygon) {
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
  }

  const latSpan = maxLat - minLat;
  const inset = latSpan > 0 ? latSpan * 0.04 : 0.00015;

  return [maxLat - inset, (minLng + maxLng) / 2];
}
