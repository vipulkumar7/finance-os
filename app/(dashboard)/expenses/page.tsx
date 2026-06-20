import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import ExpenseListClient from "@/features/expenses/components/ExpenseListClient";
import { startOfMonth, endOfMonth } from "date-fns";

interface ExpensesPageExpense {
  id: string;
  date: Date;
  item: string;
  amount: number;
  category: any;
  paymentMode: any;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams:
    | Promise<{ year?: string; month?: string }>
    | { year?: string; month?: string };
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
  const defaultMonth = newestExpense
    ? newestExpense.date.getMonth()
    : now.getMonth();

  const selectedYear = params?.year ? parseInt(params.year, 10) : defaultYear;
  const selectedMonth = params?.month
    ? parseInt(params.month, 10)
    : defaultMonth;

  const monthStart = new Date(Date.UTC(selectedYear, selectedMonth, 1));
  const monthEnd = new Date(Date.UTC(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999));

  const expenses = await prisma.expense.findMany({
    where: {
      userId: session.user.id,
      date: { gte: monthStart, lte: monthEnd },
    },
    orderBy: { date: "desc" },
  });

  return (
    <ExpenseListClient
      initialExpenses={expenses.map((e: ExpensesPageExpense) => ({
        ...e,
        date: e.date.toISOString(),
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
      }))}
      selectedYear={selectedYear}
      selectedMonth={selectedMonth}
      availableYears={availableYears}
    />
  );
}
