/**
 * Shared layout tokens for dashboard pages and centered modals (reference: anomaly report flow).
 * French UI copy lives in components; these are English-only class strings.
 */

/** Primary page `<h1>` — use with optional `<p className={PAGE_DESCRIPTION_CLASS}>`. */
export const PAGE_TITLE_CLASS =
  "m-0 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl";

export const PAGE_DESCRIPTION_CLASS =
  "m-0 mt-1 text-sm leading-relaxed text-slate-600 md:text-[0.9375rem]";

/** Standard vertical rhythm for dashboard-style pages (replaces inline `grid gap: 24px`). */
export const PAGE_STACK_CLASS = "grid gap-6";

/** Matches dashboard mobile layout offset below the fixed top bar (`dashboard/layout.tsx`). */
export const MOBILE_DASHBOARD_HEADER_TOP =
  "max-lg:top-[calc(env(safe-area-inset-top,0px)+4.75rem)]";

/** Section `<h2>` inside a card or panel. */
export const SECTION_TITLE_CLASS =
  "m-0 text-base font-semibold tracking-tight text-slate-900 sm:text-lg";

export const SECTION_DESCRIPTION_CLASS =
  "m-0 mt-0.5 text-sm leading-relaxed text-slate-600";

/** Small caption above a value in detail grids. */
export const DATA_LABEL_CLASS = "m-0 mb-1 text-xs text-slate-400";

/** Centered modal stack — pick z-index for drawer/stacking (1000 default, 1050 form, 1100 above drawers). */
export const appModalBackdrop = (zClass: "z-[1000]" | "z-[1050]" | "z-[1100]" = "z-[1050]") =>
  `fixed inset-0 ${zClass} flex items-center justify-center bg-slate-900/50 p-4`;

export const APP_MODAL_PANEL_CLASS =
  "flex max-h-[min(90dvh,38rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl max-[480px]:max-h-[min(88dvh,34rem)] max-[480px]:max-w-[min(22rem,calc(100vw-2rem))]";

/** Narrower variant for short dialogs (zone name, confirmations). */
export const APP_MODAL_PANEL_COMPACT_CLASS =
  "flex max-h-[min(90dvh,38rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl max-[480px]:max-w-[min(22rem,calc(100vw-2rem))]";

export const APP_MODAL_HEADER_CLASS =
  "shrink-0 border-b border-slate-100 px-4 py-3 sm:px-5 sm:py-4";

export const APP_MODAL_TITLE_CLASS = "text-base font-semibold text-slate-900 sm:text-lg";

export const APP_MODAL_SUBTITLE_CLASS = "mt-1 text-xs leading-snug text-slate-600 sm:text-sm";

export const APP_MODAL_BODY_CLASS =
  "flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-3 sm:gap-4 sm:px-5 sm:py-4";

export const APP_MODAL_FOOTER_CLASS =
  "flex shrink-0 flex-wrap justify-end gap-2 border-t border-slate-100 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5 sm:py-4 sm:pb-4";

export const APP_FORM_LABEL_CLASS =
  "grid gap-1.5 text-sm font-medium text-slate-700";

/** Text fields — comfortable padding for auth and full-page forms. */
export const APP_FORM_CONTROL_CLASS =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm leading-normal text-slate-900 shadow-sm outline-none transition-[box-shadow,border-color] placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30";

/**
 * Dense multi-field admin modals (e.g. container edit, challenge create).
 * Same focus ring as APP_FORM_CONTROL_CLASS; reduced padding and slightly tighter type.
 */
export const APP_FORM_LABEL_COMPACT_CLASS =
  "grid gap-0.5 text-xs font-medium text-slate-700 sm:gap-1 sm:text-sm";

export const APP_FORM_CONTROL_COMPACT_CLASS =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs leading-snug text-slate-900 shadow-sm outline-none transition-[box-shadow,border-color] placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 sm:text-sm";

export const APP_FORM_CONTROL_FOCUS_EMERALD =
  "outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30";
