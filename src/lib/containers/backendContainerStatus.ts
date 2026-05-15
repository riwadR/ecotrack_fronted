/** Mirrors backend `ContainerStatus` enum values. */
export type BackendContainerStatus = "OK" | "WARNING" | "CRITICAL" | "MAINTENANCE";

export const BACKEND_CONTAINER_STATUS_OPTIONS: {
  value: BackendContainerStatus;
  label: string;
}[] = [
  { value: "OK", label: "OK" },
  { value: "WARNING", label: "Alerte" },
  { value: "CRITICAL", label: "Critique" },
  { value: "MAINTENANCE", label: "Maintenance" },
];

export function parseBackendContainerStatus(value: unknown): BackendContainerStatus {
  if (
    value === "OK" ||
    value === "WARNING" ||
    value === "CRITICAL" ||
    value === "MAINTENANCE"
  ) {
    return value;
  }
  return "OK";
}
