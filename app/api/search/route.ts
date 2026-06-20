import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  if (!q || q.length < 2) {
    return NextResponse.json({ expenses: [], vehicle: [] });
  }

  const [expenses, vehicleExpenses] = await Promise.all([
    prisma.expense.findMany({
      where: {
        userId: session.user.id,
        item: { contains: q, mode: "insensitive" },
      },
      orderBy: { date: "desc" },
      take: 10,
    }),
    prisma.vehicleExpense.findMany({
      where: {
        userId: session.user.id,
        notes: { contains: q, mode: "insensitive" },
      },
      orderBy: { date: "desc" },
      take: 5,
    }),
  ]);

  return NextResponse.json({
    expenses: expenses.map((e: { date: { toISOString: () => any; }; }) => ({
      ...e,
      date: e.date.toISOString(),
    })),
    vehicle: vehicleExpenses.map((e: { date: { toISOString: () => any; }; }) => ({
      ...e,
      date: e.date.toISOString(),
    })),
  });
}
