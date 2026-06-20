import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import AnalyticsClient from "@/features/analytics/components/AnalyticsClient";
import { startOfYear, endOfYear } from "date-fns";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const now = new Date();
  const yearStart = startOfYear(now);
  const yearEnd = endOfYear(now);

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
        where: { userId: session.user.id, year: now.getFullYear() },
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
      year={now.getFullYear()}
    />
  );
}
