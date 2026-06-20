import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import ProfileClient from "@/features/profile/components/ProfileClient";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  return (
    <ProfileClient
      user={{
        name: session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || "",
      }}
    />
  );
}
