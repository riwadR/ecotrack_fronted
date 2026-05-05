import type { Role } from "@/models/user";

/** Whether the viewer may start a “report issue” flow from the map (placeholder for future RBAC). */
export function canShowReportIssueAction(role: Role): boolean {
  void role;
  return true;
}

/** Whether the viewer may start a “create route” flow from the map (placeholder for future RBAC). */
export function canShowCreateRouteAction(role: Role): boolean {
  return role === "ADMIN" || role === "MANAGER" || role === "AGENT";
}
