import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import BudgetClient from "@/features/budget/components/BudgetClient";

export default async function BudgetPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const budgetAllocations = await prisma.budgetAllocation.findMany({
    where: { userId: session.user.id },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });

  // Seeding default budget if empty
  let budget = budgetAllocations;
  if (!budget || budget.length === 0) {
    const DEFAULT_BUDGET = [
      { name: "SBI Large Cap", amount: 10000, type: "SIP" },
      { name: "PGIM Mid Cap", amount: 20000, type: "SIP" },
      { name: "Quant Multi Cap", amount: 15000, type: "SIP" },
      { name: "Bandhan Small Cap", amount: 5000, type: "SIP" },
      { name: "US stock and ETF", amount: 10000, type: "SIP" },
      { name: "HDFC gold ETF", amount: 5000, type: "SIP" },
      { name: "Kotaj Arbitrage Fund", amount: 3500, type: "SIP" },
      { name: "EMI", amount: 12000, type: "EMI" },
      { name: "Expense", amount: 35000, type: "EXPENSE" },
    ];

    await prisma.budgetAllocation.createMany({
      data: DEFAULT_BUDGET.map((item) => ({
        ...item,
        userId: session.user.id,
      })),
      skipDuplicates: true,
    });

    budget = await prisma.budgetAllocation.findMany({
      where: { userId: session.user.id },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });
  }

  return (
    <BudgetClient
      initialBudget={budget.map((b: any) => ({
        ...b,
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString(),
      }))}
    />
  );
}
