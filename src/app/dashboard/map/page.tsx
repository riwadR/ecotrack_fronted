import { redirect } from "next/navigation";

export default function LegacyMapRoutePage() {
  redirect("/dashboard/infrastructure");
}
