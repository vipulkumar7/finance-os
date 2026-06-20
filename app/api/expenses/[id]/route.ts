import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { expenseSchema } from "@/lib/validations/schemas";

// GET /api/expenses/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const expense = await prisma.expense.findFirst({
    where: { id, userId: session.user.id },
    include: { vehicleExpense: true },
  });

  if (!expense) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Flatten relation in response
  const { vehicleExpense, ...rest } = expense;
  return NextResponse.json({
    ...rest,
    vehicleType: vehicleExpense?.type || null,
  });
}

// PUT /api/expenses/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const validated = expenseSchema.parse(body);
    const { vehicleType, ...validatedData } = validated;

    // Verify ownership
    const existing = await prisma.expense.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx: any) => {
      const expense = await tx.expense.update({
        where: { id },
        data: {
          ...validatedData,
          date: new Date(validatedData.date),
        },
      });

      if (validatedData.category === "VEHICLE" && vehicleType) {
        await tx.vehicleExpense.upsert({
          where: { expenseId: id },
          update: {
            date: new Date(validatedData.date),
            amount: validatedData.amount,
            type: vehicleType as any,
            notes: validatedData.notes || "",
          },
          create: {
            date: new Date(validatedData.date),
            amount: validatedData.amount,
            type: vehicleType as any,
            notes: validatedData.notes || "",
            userId: session.user.id,
            expenseId: id,
          },
        });
      } else {
        await tx.vehicleExpense.deleteMany({
          where: { expenseId: id },
        });
      }

      return expense;
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Invalid data" },
      { status: 400 }
    );
  }
}

// DELETE /api/expenses/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify ownership and delete (cascade handles vehicleExpense)
  const expense = await prisma.expense.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!expense) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.expense.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}

