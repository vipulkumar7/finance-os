import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import InvestmentClient from "@/features/investments/components/InvestmentClient";

export default async function InvestmentsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const year = new Date().getFullYear();
  const investments = await prisma.investmentEntry.findMany({
    where: { userId: session.user.id, year },
    orderBy: { month: "asc" },
  });

  return (
    <InvestmentClient
      initialData={investments.map((i) => ({
        ...i,
        createdAt: i.createdAt.toISOString(),
        updatedAt: i.updatedAt.toISOString(),
      }))}
      year={year}
    />
  );
}
