"use client";

import type { BackendContainerStatus } from "@/lib/containers/backendContainerStatus";
import { parseBackendContainerStatus } from "@/lib/containers/backendContainerStatus";
import {
  getContainerStatusLabel,
  STATUS_BADGE_CLASS_BY_STATUS,
} from "@/lib/containers/containerOperationalStatus";

export type ContainerOperationalStatusBadgeProps = {
  status?: BackendContainerStatus | string | null;
};

export default function ContainerOperationalStatusBadge({
  status,
}: ContainerOperationalStatusBadgeProps) {
  const resolved = parseBackendContainerStatus(status);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${STATUS_BADGE_CLASS_BY_STATUS[resolved]}`}
    >
      {getContainerStatusLabel(resolved)}
    </span>
  );
}
