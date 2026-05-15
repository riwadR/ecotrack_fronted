import { redirect } from "next/navigation";

export default function LegacyZonesRoutePage() {
  redirect("/dashboard/infrastructure");
}
