import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import NetWorthClient from "@/features/net-worth/components/NetWorthClient";

export default async function NetWorthPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const snapshots = await prisma.netWorthSnapshot.findMany({
    where: { userId: session.user.id },
    orderBy: [{ year: "asc" }, { month: "asc" }],
  });

  return (
    <NetWorthClient
      snapshots={snapshots.map((s) => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      }))}
    />
  );
}
