import type { TourAgent, TourResponseDTO } from "@/models/tour";

export type TourLiveAgentPosition = {
  latitude: number;
  longitude: number;
  label: string;
};

export function resolveTourLiveAgent(
  tour: TourResponseDTO | null | undefined
): TourLiveAgentPosition | null {
  if (!tour || tour.status !== "IN_PROGRESS") {
    return null;
  }

  const agentWithPosition = tour.agents.find(hasAgentGpsPosition);
  if (!agentWithPosition) {
    return null;
  }

  return {
    latitude: agentWithPosition.currentLatitude!,
    longitude: agentWithPosition.currentLongitude!,
    label: agentWithPosition.username,
  };
}

function hasAgentGpsPosition(agent: TourAgent): boolean {
  return (
    typeof agent.currentLatitude === "number" &&
    Number.isFinite(agent.currentLatitude) &&
    typeof agent.currentLongitude === "number" &&
    Number.isFinite(agent.currentLongitude)
  );
}
