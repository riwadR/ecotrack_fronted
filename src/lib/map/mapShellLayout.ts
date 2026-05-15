/**
 * Responsive map shell Tailwind classes for Leaflet-backed dashboard views.
 *
 * Uses `dvh` so map height reacts to mobile browser UI (dynamic toolbars). Min heights keep pinch/zoom usable;
 * max caps avoid excessive blank map on ultrawide/tall desktops. Does not alter data fetching or overlays.
 */

/** Citizen / operational map (`InteractiveMap` frame — usually inside a card with its own outer border). */
export const MAP_FRAME_CLASS_CITIZEN =
  "relative z-0 w-full overflow-hidden rounded-xl touch-manipulation " +
  "min-h-[260px] sm:min-h-[300px] md:min-h-[340px] " +
  "h-[min(66dvh,520px)] sm:h-[min(68dvh,580px)] lg:h-[min(70dvh,620px)] " +
  "max-h-[min(84dvh,720px)]";

/** Admin infrastructure / zone drawing map (includes chrome; polygon tools sit inside the same pane). */
export const MAP_FRAME_CLASS_ADMIN =
  "ecotrack-zone-draw-map relative flex w-full touch-manipulation flex-col overflow-hidden rounded-xl border border-slate-200 shadow-sm " +
  "min-h-[260px] sm:min-h-[300px] md:min-h-[360px] " +
  "h-[min(64dvh,540px)] sm:h-[min(66dvh,600px)] lg:h-[min(72dvh,640px)] " +
  "max-h-[min(86dvh,760px)]";

/** Placeholder / SSR loading block for citizen map routes — matches {@link MAP_FRAME_CLASS_CITIZEN} heights. */
export const MAP_LOADING_CLASS_CITIZEN =
  "flex w-full items-center justify-center rounded-xl touch-manipulation border border-slate-200 bg-slate-50 text-slate-600 " +
  "min-h-[260px] sm:min-h-[300px] md:min-h-[340px] " +
  "h-[min(66dvh,520px)] sm:h-[min(68dvh,580px)] lg:h-[min(70dvh,620px)] " +
  "max-h-[min(84dvh,720px)]";

/** Placeholder for admin zone map — matches {@link MAP_FRAME_CLASS_ADMIN} heights. */
export const MAP_LOADING_CLASS_ADMIN =
  "flex w-full items-center justify-center rounded-xl touch-manipulation border border-slate-200 bg-slate-50 text-slate-600 " +
  "min-h-[260px] sm:min-h-[300px] md:min-h-[360px] " +
  "h-[min(64dvh,540px)] sm:h-[min(66dvh,600px)] lg:h-[min(72dvh,640px)] " +
  "max-h-[min(86dvh,760px)]";
