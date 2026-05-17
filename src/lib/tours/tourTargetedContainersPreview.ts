import type { ContainerType } from "@/models/container";
import type { Container } from "@/models/map";
import type { SelectedTourContainer } from "@/lib/tours/tourPlanningConstants";

export type TargetedContainerPreviewItem = {
  id: string;
  serialNumber: string;
  containerType: ContainerType;
  zoneId: string;
  zoneName: string;
  fillLevelPercent: number;
};

export type TargetedContainersByZone = {
  zoneId: string;
  zoneName: string;
  containers: TargetedContainerPreviewItem[];
};

export function filterAutoPreviewContainers(
  containers: Container[],
  zoneIds: ReadonlySet<string>,
  minFillLevel: number,
  selectedTypes: ContainerType[]
): TargetedContainerPreviewItem[] {
  const typeSet = new Set(selectedTypes);

  return containers
    .filter((container) => {
      if (!container.zoneId || !zoneIds.has(container.zoneId)) {
        return false;
      }
      if (container.fillLevelPercent < minFillLevel) {
        return false;
      }
      if (
        container.containerType &&
        typeSet.size > 0 &&
        !typeSet.has(container.containerType)
      ) {
        return false;
      }
      return true;
    })
    .map((container) => ({
      id: container.id,
      serialNumber: container.serialNumber ?? container.id,
      containerType: container.containerType ?? "GENERAL",
      zoneId: container.zoneId!,
      zoneName: container.zoneName ?? "Zone inconnue",
      fillLevelPercent: container.fillLevelPercent,
    }))
    .sort((a, b) => {
      const zoneCompare = a.zoneName.localeCompare(b.zoneName, "fr");
      if (zoneCompare !== 0) {
        return zoneCompare;
      }
      return a.serialNumber.localeCompare(b.serialNumber, "fr");
    });
}

export function selectedContainersToPreviewItems(
  selected: SelectedTourContainer[],
  mapContainers: Container[],
  zoneNameById: ReadonlyMap<string, string>
): TargetedContainerPreviewItem[] {
  const containerById = new Map(mapContainers.map((container) => [container.id, container]));

  return selected.map((item) => {
    const mapRow = containerById.get(item.id);
    const zoneId = item.zoneId ?? mapRow?.zoneId ?? "";
    return {
      id: item.id,
      serialNumber: item.serialNumber,
      containerType: mapRow?.containerType ?? "GENERAL",
      zoneId,
      zoneName:
        item.zoneName ??
        mapRow?.zoneName ??
        zoneNameById.get(zoneId) ??
        "Zone inconnue",
      fillLevelPercent: mapRow?.fillLevelPercent ?? 0,
    };
  });
}

export function groupTargetedContainersByZone(
  items: TargetedContainerPreviewItem[]
): TargetedContainersByZone[] {
  const groups = new Map<string, TargetedContainersByZone>();

  for (const item of items) {
    const existing = groups.get(item.zoneId);
    if (existing) {
      existing.containers.push(item);
      continue;
    }
    groups.set(item.zoneId, {
      zoneId: item.zoneId,
      zoneName: item.zoneName,
      containers: [item],
    });
  }

  return Array.from(groups.values()).sort((a, b) =>
    a.zoneName.localeCompare(b.zoneName, "fr")
  );
}

/** Groups by zone while preserving the visit order (manual route preview). */
export function groupTargetedContainersPreservingOrder(
  items: TargetedContainerPreviewItem[]
): TargetedContainersByZone[] {
  const sections: TargetedContainersByZone[] = [];

  for (const item of items) {
    const last = sections[sections.length - 1];
    if (last?.zoneId === item.zoneId) {
      last.containers.push(item);
    } else {
      sections.push({
        zoneId: item.zoneId,
        zoneName: item.zoneName,
        containers: [item],
      });
    }
  }

  return sections;
}

export function moveSelectedContainer(
  containers: SelectedTourContainer[],
  containerId: string,
  direction: "up" | "down"
): SelectedTourContainer[] {
  const index = containers.findIndex((item) => item.id === containerId);
  if (index < 0) {
    return containers;
  }

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= containers.length) {
    return containers;
  }

  const next = [...containers];
  const [moved] = next.splice(index, 1);
  next.splice(targetIndex, 0, moved);
  return next;
}

export function moveOrderedContainerIds(
  orderedIds: string[],
  containerId: string,
  direction: "up" | "down"
): string[] {
  const index = orderedIds.indexOf(containerId);
  if (index < 0) {
    return orderedIds;
  }

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= orderedIds.length) {
    return orderedIds;
  }

  const next = [...orderedIds];
  const [moved] = next.splice(index, 1);
  next.splice(targetIndex, 0, moved);
  return next;
}

export function buildPreviewItemsFromOrderedIds(
  orderedIds: string[],
  mapContainers: Container[],
  zoneNameById: ReadonlyMap<string, string>
): TargetedContainerPreviewItem[] {
  const containerById = new Map(mapContainers.map((container) => [container.id, container]));

  return orderedIds
    .map((id) => {
      const container = containerById.get(id);
      if (!container) {
        return null;
      }
      const zoneId = container.zoneId ?? "";
      return {
        id: container.id,
        serialNumber: container.serialNumber ?? container.id,
        containerType: container.containerType ?? "GENERAL",
        zoneId,
        zoneName: container.zoneName ?? zoneNameById.get(zoneId) ?? "Zone inconnue",
        fillLevelPercent: container.fillLevelPercent,
      };
    })
    .filter((item): item is TargetedContainerPreviewItem => item != null);
}

export function orderedIdsMatchFilterPreview(
  orderedIds: string[],
  filterItems: TargetedContainerPreviewItem[]
): boolean {
  if (orderedIds.length !== filterItems.length) {
    return false;
  }
  const filterIdSet = new Set(filterItems.map((item) => item.id));
  return orderedIds.every((id) => filterIdSet.has(id));
}
