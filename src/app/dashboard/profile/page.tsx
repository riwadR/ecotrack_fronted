import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import ProfileClientPage from "./profile-client-page";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return <ProfileClientPage session={session} />;
}