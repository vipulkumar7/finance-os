import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import ExpenseListClient from "@/features/expenses/components/ExpenseListClient";

export default async function ExpensesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const expenses = await prisma.expense.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    take: 50,
  });

  return (
    <ExpenseListClient
      initialExpenses={expenses.map((e) => ({
        ...e,
        date: e.date.toISOString(),
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
      }))}
    />
  );
}
