import type { ContainerType } from "@/models/container";

export const CONTAINER_TYPE_VALUES: ContainerType[] = ["GLASS", "PLASTIC", "PAPER", "GENERAL"];

const CONTAINER_TYPE_LABELS: Record<ContainerType, string> = {
  GLASS: "Verre",
  PLASTIC: "Plastique",
  PAPER: "Papier",
  GENERAL: "Ordures ménagères",
};

/** Options ordered for selects (French labels). */
export const CONTAINER_TYPE_FORM_OPTIONS: Array<{ value: ContainerType; label: string }> =
  CONTAINER_TYPE_VALUES.map((value) => ({
    value,
    label: CONTAINER_TYPE_LABELS[value],
  }));

export function getContainerTypeLabel(type: string | null | undefined): string {
  if (!type) {
    return "—";
  }
  const key = type.toUpperCase() as ContainerType;
  return CONTAINER_TYPE_LABELS[key] ?? type;
}

export function resolveContainerType(
  type?: string | null,
  wasteType?: string | null
): ContainerType | undefined {
  const raw = (type ?? wasteType)?.toUpperCase();
  if (raw && (CONTAINER_TYPE_VALUES as readonly string[]).includes(raw)) {
    return raw as ContainerType;
  }
  return undefined;
}
