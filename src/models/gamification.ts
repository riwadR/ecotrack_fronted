export type Badge = {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  requiredPoints: number;
};

export type GamificationProfile = {
  userId?: string;
  totalPoints: number;
  co2Saved: number;
  earnedBadges: Badge[];
};

export type LeaderboardEntry = {
  rank: number;
  firstName: string;
  lastName?: string;
  totalPoints: number;
  co2Saved: number;
};
