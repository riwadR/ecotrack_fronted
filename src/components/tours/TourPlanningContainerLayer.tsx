"use client";

import { LayerGroup } from "react-leaflet";
import type { Container } from "@/models/map";
import TourPlanningContainerMarker from "@/components/tours/TourPlanningContainerMarker";

export type TourPlanningContainerLayerProps = {
  containers: Container[];
  selectionEnabled: boolean;
  selectedContainerIds: Set<string>;
  onToggleContainer: (container: Container) => void;
};

export default function TourPlanningContainerLayer({
  containers,
  selectionEnabled,
  selectedContainerIds,
  onToggleContainer,
}: TourPlanningContainerLayerProps) {
  return (
    <LayerGroup>
      {containers.map((container) => (
        <TourPlanningContainerMarker
          key={container.id}
          container={container}
          isSelected={selectedContainerIds.has(container.id)}
          selectionEnabled={selectionEnabled}
          onToggle={onToggleContainer}
        />
      ))}
    </LayerGroup>
  );
}
