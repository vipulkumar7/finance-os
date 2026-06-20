import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import CalendarClient from "@/features/calendar/components/CalendarClient";
import { startOfYear, endOfYear } from "date-fns";

export default async function CalendarPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const now = new Date();
  const expenses = await prisma.expense.findMany({
    where: {
      userId: session.user.id,
      date: { gte: startOfYear(now), lte: endOfYear(now) },
    },
    orderBy: { date: "asc" },
  });

  // Aggregate by day
  const dailyData: Record<string, { total: number; items: { item: string; amount: number; category: string }[] }> = {};
  expenses.forEach((e) => {
    const key = e.date.toISOString().split("T")[0];
    if (!dailyData[key]) dailyData[key] = { total: 0, items: [] };
    dailyData[key].total += e.amount;
    dailyData[key].items.push({ item: e.item, amount: e.amount, category: e.category });
  });

  return <CalendarClient dailyData={dailyData} year={now.getFullYear()} />;
}
