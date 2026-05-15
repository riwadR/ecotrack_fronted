"use client";

import { LayerGroup } from "react-leaflet";
import type { AdminMapContainer } from "@/lib/map/adminMapContainer";
import InfrastructureContainerMarker from "@/components/infrastructure/InfrastructureContainerMarker";

export type InfrastructureContainerLayerProps = {
  containers: AdminMapContainer[];
  canManage: boolean;
  relocatingContainerId: string | null;
  onContainerDragEnd: (
    container: AdminMapContainer,
    latitude: number,
    longitude: number
  ) => void;
  onRequestRelocation: (container: AdminMapContainer) => void;
  onRequestEdit: (container: AdminMapContainer) => void;
};

/** Container markers isolated from zone polygon rendering. */
export default function InfrastructureContainerLayer({
  containers,
  canManage,
  relocatingContainerId,
  onContainerDragEnd,
  onRequestRelocation,
  onRequestEdit,
}: InfrastructureContainerLayerProps) {
  return (
    <LayerGroup>
      {containers.map((container) => (
        <InfrastructureContainerMarker
          key={container.id}
          container={container}
          canManage={canManage}
          isRelocating={relocatingContainerId === container.id}
          onDragEnd={onContainerDragEnd}
          onRequestRelocation={onRequestRelocation}
          onRequestEdit={onRequestEdit}
        />
      ))}
    </LayerGroup>
  );
}
