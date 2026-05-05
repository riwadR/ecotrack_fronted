/** Discrete fill-level band used for marker styling. */
export type FillLevelCategory = "low" | "moderate" | "high";

/**
 * Maps a fill percentage to a styling band (operations dashboard spec):
 * - low: strictly below 50%
 * - moderate: 50% up to and including 90%
 * - high: above 90%
 */
export function getFillLevelCategory(fillLevelPercent: number): FillLevelCategory {
  if (fillLevelPercent < 50) return "low";
  if (fillLevelPercent <= 90) return "moderate";
  return "high";
}
