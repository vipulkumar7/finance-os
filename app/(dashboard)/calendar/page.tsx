import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import CalendarClient from "@/features/calendar/components/CalendarClient";
import { startOfYear, endOfYear } from "date-fns";

interface CalendarExpense {
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

export default async function CalendarPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const now = new Date();
  const currentYear = now.getFullYear();
  const yearStart = new Date(Date.UTC(currentYear, 0, 1));
  const yearEnd = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999));
  const expenses = (await prisma.expense.findMany({
    where: {
      userId: session.user.id,
      date: { gte: yearStart, lte: yearEnd },
    },
    orderBy: { date: "asc" },
  })) as CalendarExpense[];

  // Aggregate by day
  const dailyData: Record<string, { total: number; items: { item: string; amount: number; category: string }[] }> = {};
  expenses.forEach((e: CalendarExpense) => {
    const key = e.date.toISOString().split("T")[0];
    if (!dailyData[key]) dailyData[key] = { total: 0, items: [] };
    dailyData[key].total += e.amount;
    dailyData[key].items.push({ item: e.item, amount: e.amount, category: e.category });
  });

  return <CalendarClient dailyData={dailyData} year={now.getFullYear()} />;
}
