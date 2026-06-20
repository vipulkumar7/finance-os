import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import GoalsClient from "@/features/goals/components/GoalsClient";

export default async function GoalsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const goals = await prisma.goal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <GoalsClient
      initialGoals={goals.map((g) => ({
        ...g,
        targetDate: g.targetDate.toISOString(),
        createdAt: g.createdAt.toISOString(),
        updatedAt: g.updatedAt.toISOString(),
      }))}
    />
  );
}
