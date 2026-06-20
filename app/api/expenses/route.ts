import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { expenseSchema } from "@/lib/validations/schemas";

// GET /api/expenses — List expenses with filters
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const paymentMode = searchParams.get("paymentMode") || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

  const where: any = { userId: session.user.id };

  if (search) {
    where.item = { contains: search, mode: "insensitive" };
  }
  if (category) {
    where.category = category;
  }
  if (paymentMode) {
    where.paymentMode = paymentMode;
  }
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.expense.count({ where }),
  ]);

  return NextResponse.json({
    expenses,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

// POST /api/expenses — Create expense
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = expenseSchema.parse(body);
    const { vehicleType, ...validatedData } = validated;

    const expense = await prisma.$transaction(async (tx: any) => {
      const createdExpense = await tx.expense.create({
        data: {
          ...validatedData,
          date: new Date(validatedData.date),
          userId: session.user.id,
        },
      });

      if (validatedData.category === "VEHICLE" && vehicleType) {
        await tx.vehicleExpense.create({
          data: {
            date: new Date(validatedData.date),
            amount: validatedData.amount,
            type: vehicleType as any,
            notes: validatedData.notes || "",
            userId: session.user.id,
            expenseId: createdExpense.id,
          },
        });
      }

      return createdExpense;
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Invalid data" },
      { status: 400 }
    );
  }
}

