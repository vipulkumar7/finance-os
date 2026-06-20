import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import AnalyticsClient from "@/features/analytics/components/AnalyticsClient";
import { startOfYear, endOfYear } from "date-fns";

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

  const yearStart = startOfYear(new Date(selectedYear, 5, 15)); // Use mid-year to avoid TZ shifts
  const yearEnd = endOfYear(new Date(selectedYear, 5, 15));

  const [expenses, investments, netWorthSnapshots, vehicleExpenses] =
    await Promise.all([
      prisma.expense.findMany({
        where: {
          userId: session.user.id,
          date: { gte: yearStart, lte: yearEnd },
        },
        orderBy: { date: "asc" },
      }),
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
      }),
    ]);

  return (
    <AnalyticsClient
      expenses={expenses.map((e: { date: { toISOString: () => any } }) => ({
        ...e,
        date: e.date.toISOString(),
      }))}
      investments={investments}
      netWorthSnapshots={netWorthSnapshots}
      vehicleExpenses={vehicleExpenses.map(
        (e: { date: { toISOString: () => any } }) => ({
          ...e,
          date: e.date.toISOString(),
        }),
      )}
      year={selectedYear}
      availableYears={availableYears}
    />
  );
}
