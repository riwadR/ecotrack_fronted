import { redirect } from "next/navigation";
import ChallengesGalleryPage from "@/components/challenges/ChallengesGalleryPage";
import { getSession } from "@/lib/auth";

export default async function ChallengesPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (session.role !== "CITIZEN") {
    redirect("/dashboard/unauthorized");
  }

  return <ChallengesGalleryPage />;
}
