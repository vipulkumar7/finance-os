import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import AnalyticsClient from "@/features/analytics/components/AnalyticsClient";
import { startOfYear, endOfYear } from "date-fns";

interface DBExpense {
  id: string;
  date: Date;
  item: string;
  amount: number;
  category: any;
  paymentMode: any;
  notes: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DBVehicleExpense {
  id: string;
  date: Date;
  amount: number;
  type: any;
  notes: string | null;
  userId: string;
  expenseId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }> | { year?: string };
}) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  // Find dynamic list of years with data
  const oldestExpense = await prisma.expense.findFirst({
    where: { userId: session.user.id },
    orderBy: { date: "asc" },
    select: { date: true },
  });
  const newestExpense = await prisma.expense.findFirst({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    select: { date: true },
  });

  const now = new Date();
  const currentYear = now.getFullYear();
  const startYear = oldestExpense
    ? oldestExpense.date.getFullYear()
    : currentYear - 1;
  const endYear = newestExpense
    ? newestExpense.date.getFullYear()
    : currentYear;

  const availableYears = [];
  for (let y = startYear; y <= Math.max(endYear, currentYear); y++) {
    availableYears.push(y);
  }

  const defaultYear = newestExpense
    ? newestExpense.date.getFullYear()
    : currentYear;
  const selectedYear = params?.year ? parseInt(params.year, 10) : defaultYear;

  const yearStart = new Date(Date.UTC(selectedYear, 0, 1));
  const yearEnd = new Date(Date.UTC(selectedYear, 11, 31, 23, 59, 59, 999));

  const [expenses, investments, netWorthSnapshots, vehicleExpenses] =
    await Promise.all([
      prisma.expense.findMany({
        where: {
          userId: session.user.id,
          date: { gte: yearStart, lte: yearEnd },
        },
        orderBy: { date: "asc" },
      }) as Promise<DBExpense[]>,
      prisma.investmentEntry.findMany({
        where: { userId: session.user.id, year: selectedYear },
        orderBy: { month: "asc" },
      }),
      prisma.netWorthSnapshot.findMany({
        where: { userId: session.user.id },
        orderBy: [{ year: "asc" }, { month: "asc" }],
      }),
      prisma.vehicleExpense.findMany({
        where: {
          userId: session.user.id,
          date: { gte: yearStart, lte: yearEnd },
        },
        orderBy: { date: "asc" },
      }) as Promise<DBVehicleExpense[]>,
    ]);

  let budgetAllocations = await prisma.budgetAllocation.findMany({
    where: { userId: session.user.id },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });

  if (!budgetAllocations || budgetAllocations.length === 0) {
    const DEFAULT_BUDGET = [
      { name: "SBI Large Cap", amount: 10000, type: "Mutual Funds" },
      { name: "PGIM Mid Cap", amount: 20000, type: "Mutual Funds" },
      { name: "Quant Multi Cap", amount: 15000, type: "Mutual Funds" },
      { name: "Bandhan Small Cap", amount: 5000, type: "Mutual Funds" },
      { name: "US stock and ETF", amount: 10000, type: "Stocks" },
      { name: "HDFC gold ETF", amount: 5000, type: "Gold" },
      { name: "Kotaj Arbitrage Fund", amount: 3500, type: "Arbitrage" },
      { name: "EMI", amount: 12000, type: "EMI" },
      { name: "Expense", amount: 35000, type: "Expense" },
    ];

    await prisma.budgetAllocation.createMany({
      data: DEFAULT_BUDGET.map((item) => ({
        ...item,
        userId: session.user.id,
      })),
      skipDuplicates: true,
    });

    budgetAllocations = await prisma.budgetAllocation.findMany({
      where: { userId: session.user.id },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });
  }

  return (
    <AnalyticsClient
      expenses={expenses.map((e: DBExpense) => ({
        ...e,
        date: e.date.toISOString(),
      }))}
      investments={investments}
      netWorthSnapshots={netWorthSnapshots}
      vehicleExpenses={vehicleExpenses.map((e: DBVehicleExpense) => ({
        ...e,
        date: e.date.toISOString(),
      }))}
      year={selectedYear}
      availableYears={availableYears}
      initialBudget={budgetAllocations?.map((b: any) => ({
        ...b,
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString(),
      }))}
    />
  );
}
