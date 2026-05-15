import type { Container } from "@/models/container";

export function containerDisplayName(container: Container): string {
  return (
    container.serialNumber?.trim() ||
    container.code?.trim() ||
    container.name?.trim() ||
    container.id
  );
}
