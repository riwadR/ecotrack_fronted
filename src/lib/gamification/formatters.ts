export function resolveCo2SavedKg(co2Saved?: number | null): number {
  if (typeof co2Saved === "number" && Number.isFinite(co2Saved)) {
    return co2Saved;
  }

  return 0;
}

export function formatPointsLabel(totalPoints: number): string {
  return new Intl.NumberFormat("fr-FR").format(totalPoints);
}

export function formatCo2Label(co2Kg: number): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: co2Kg >= 10 ? 1 : 2,
    maximumFractionDigits: co2Kg >= 10 ? 1 : 2,
  }).format(co2Kg);
}

export function resolveBadgeIconSrc(iconUrl: string): string {
  if (!iconUrl) return "/images/badges/premier-pas.svg";
  if (iconUrl.startsWith("http://") || iconUrl.startsWith("https://")) {
    return iconUrl;
  }

  return iconUrl.startsWith("/") ? iconUrl : `/${iconUrl}`;
}
