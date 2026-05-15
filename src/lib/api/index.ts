export { apiClient, backendApiClient, default } from "@/lib/api/apiClient";
export {
  AUTH_UI_MESSAGES,
  SESSION_EXPIRED_EVENT,
  handleSessionExpired,
  onSessionExpired,
  resetSessionExpiredGuard,
  type SessionExpiredDetail,
} from "@/lib/api/authSession";
export { getCsrfTokenFromCookie, applyCsrfHeader } from "@/lib/api/csrf";
export {
  extractApiErrorMessage,
  toApiError,
} from "@/lib/api/apiErrors";
export {
  createChallenge,
  getChallengeDetail,
  getChallenges,
  getMyChallengeReports,
  joinChallenge,
  type Challenge,
  type ChallengeContribution,
  type ChallengeCreatePayload,
  type ChallengeDetail,
  type ChallengeOutcome,
  type ChallengeUserReport,
  type ChallengeZone,
} from "@/lib/api/challenges";
