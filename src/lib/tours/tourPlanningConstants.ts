import type { PathOptions } from "leaflet";

/** Zone polygons for the tour planning workspace map (blue, semi-transparent fill). */
export const TOUR_PLANNING_ZONE_PATH_OPTIONS: PathOptions = {
  color: "#2563eb",
  weight: 2,
  fillColor: "#3b82f6",
  fillOpacity: 0.2,
};

/** Map shell height for tour workspace (mobile-first). */
export const TOUR_PLANNING_MAP_FRAME_CLASS =
  "relative z-0 block h-[50vh] min-h-[300px] w-full overflow-hidden rounded-xl touch-manipulation lg:h-full lg:min-h-[280px]";

export type SelectedTourContainer = {
  id: string;
  serialNumber: string;
  zoneId?: string;
  zoneName?: string;
};
