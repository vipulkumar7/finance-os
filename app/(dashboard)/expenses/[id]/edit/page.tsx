import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import ExpenseFormClient from "@/features/expenses/components/ExpenseFormClient";
import { notFound } from "next/navigation";

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const { id } = await params;
  const expense = await prisma.expense.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!expense) notFound();

  return (
    <ExpenseFormClient
      initialData={{
        id: expense.id,
        date: expense.date.toISOString(),
        item: expense.item,
        amount: expense.amount,
        category: expense.category,
        paymentMode: expense.paymentMode,
        notes: expense.notes,
      }}
    />
  );
}
