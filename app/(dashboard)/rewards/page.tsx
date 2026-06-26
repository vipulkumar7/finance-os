import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import RewardsClient from "@/features/rewards/components/RewardsClient";

const DEFAULT_CARDS = [
  "SBI Cashback Credit Card",
  "HDFC Regalia Gold Credit Card",
  "HDFC UPI RuPay Credit Card",
  "Yes Bank Ace Credit Card",
  "HDFC Millennia Debit Card",
];

export default async function RewardsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  let rewards = await prisma.cardReward.findMany({
    where: { userId },
    orderBy: { cardName: "asc" },
  });

  if (rewards.length === 0) {
    const dataToCreate = DEFAULT_CARDS.map((cardName) => ({
      cardName,
      points: 0,
      valueInInr: 0,
      userId,
    }));

    await prisma.cardReward.createMany({
      data: dataToCreate,
      skipDuplicates: true,
    });

    rewards = await prisma.cardReward.findMany({
      where: { userId },
      orderBy: { cardName: "asc" },
    });
  }

  return (
    <RewardsClient
      initialRewards={rewards.map((r: any) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }))}
    />
  );
}
