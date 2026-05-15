import { backendApiClient } from "@/lib/api/apiClient";
import { toApiError } from "@/lib/api/apiErrors";
import type { ReportType } from "@/models/report";

export type ChallengeZone = {
  id: string;
  name: string;
};

export type ChallengeOutcome =
  | "UPCOMING"
  | "IN_PROGRESS"
  | "SUCCEEDED"
  | "FAILED";

export type Challenge = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  goalThreshold: number;
  currentProgress: number;
  zone: ChallengeZone;
  hasJoined: boolean;
  participantCount: number;
  outcome: ChallengeOutcome;
};

export type ChallengeCreatePayload = {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  goalThreshold: number;
  zoneId: string;
};

export type ChallengeUpdatePayload = ChallengeCreatePayload;

export type ChallengeContribution = {
  reportId: string;
  occurredAt: string;
  reportType: ReportType;
  reporterId: string;
  reporterPseudonym: string;
  containerId: string;
  containerSerialNumber: string;
  zoneId: string;
  zoneName: string;
};

export type ChallengeDetail = {
  challenge: Challenge;
  contributions: ChallengeContribution[];
  myContributions: ChallengeContribution[];
  otherContributions: ChallengeContribution[];
  myContributionCount: number;
};

export type ChallengeUserReport = ChallengeContribution & {
  challengeId: string;
  challengeTitle: string;
};

export async function getChallenges(): Promise<Challenge[]> {
  try {
    const { data } = await backendApiClient.get<Challenge[]>("challenges");
    return data;
  } catch (error) {
    throw toApiError(error, "Impossible de charger les défis.");
  }
}

export async function getChallengeDetail(challengeId: string): Promise<ChallengeDetail> {
  try {
    const { data } = await backendApiClient.get<ChallengeDetail>(
      `challenges/${encodeURIComponent(challengeId)}`
    );
    const contributions = data.contributions ?? [];
    return {
      ...data,
      contributions,
      myContributions: data.myContributions ?? [],
      otherContributions: data.otherContributions ?? contributions,
    };
  } catch (error) {
    throw toApiError(error, "Impossible de charger le détail du défi.");
  }
}

export async function getMyChallengeReports(): Promise<ChallengeUserReport[]> {
  try {
    const { data } = await backendApiClient.get<ChallengeUserReport[]>("challenges/me/reports");
    return data;
  } catch (error) {
    throw toApiError(error, "Impossible de charger vos signalements.");
  }
}

export async function joinChallenge(challengeId: string): Promise<void> {
  try {
    await backendApiClient.post(`challenges/${encodeURIComponent(challengeId)}/join`);
  } catch (error) {
    throw toApiError(error, "Impossible de rejoindre ce défi.");
  }
}

export async function createChallenge(payload: ChallengeCreatePayload): Promise<Challenge> {
  try {
    const { data } = await backendApiClient.post<Challenge>("challenges", payload);
    return data;
  } catch (error) {
    throw toApiError(error, "Impossible de créer le défi.");
  }
}

export async function updateChallenge(
  id: string,
  payload: ChallengeUpdatePayload
): Promise<Challenge> {
  try {
    const { data } = await backendApiClient.put<Challenge>(
      `challenges/${encodeURIComponent(id)}`,
      payload
    );
    return data;
  } catch (error) {
    throw toApiError(error, "Impossible de mettre à jour le défi.");
  }
}

export async function deleteChallenge(id: string): Promise<void> {
  try {
    await backendApiClient.delete(`challenges/${encodeURIComponent(id)}`);
  } catch (error) {
    throw toApiError(error, "Impossible de supprimer le défi.");
  }
}
