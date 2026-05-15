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
