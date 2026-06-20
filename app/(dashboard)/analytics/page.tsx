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
  const startYear = oldestExpense ? oldestExpense.date.getFullYear() : currentYear - 1;
  const endYear = newestExpense ? newestExpense.date.getFullYear() : currentYear;
  
  const availableYears = [];
  for (let y = startYear; y <= Math.max(endYear, currentYear); y++) {
    availableYears.push(y);
  }

  const defaultYear = newestExpense ? newestExpense.date.getFullYear() : currentYear;
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
    />
  );
}
