export type RankedCount = {
  label: string;
  count: number;
};

export type TourSummary = {
  ref: string;
  date: string;
  zoneName: string;
  statusLabel: string;
  onTimeLabel: string;
  agentNames: string[];
  estimatedDuration: string;
  actualDuration: string;
  distanceKm: number | null;
};

export type ChallengeSummary = {
  name: string;
  participantCount: number;
  reportsCount: number;
  outcomeLabel: string;
};

export type ReportMetrics = {
  completedTours: number;
  totalDistanceKm: number;
  totalVolumeCollected: number;
  tours: TourSummary[];
  avgTimeBetweenPickups: string;
  estimatedCo2Saved: number;
  activeAlerts: number;
  resolvedAlerts: number;
  topZonesByAlerts: RankedCount[];
  topContainerTypesByAlerts: RankedCount[];
  citizenReports: number;
  agentReports: number;
  systemReports: number;
  estimatedPointsDistributed: number;
  challenges: ChallengeSummary[];
  reportsWithPhoto: number;
  reportsPending: number;
  reportsValidated: number;
  reportsInProgress: number;
  reportsResolved: number;
  reportsRejected: number;
  estimatedActiveUsers: number;
  reportsByType: RankedCount[];
};
