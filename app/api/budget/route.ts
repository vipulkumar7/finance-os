import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

const DEFAULT_BUDGET = [
  { name: "SBI Large Cap", amount: 10000, type: "SIP" },
  { name: "PGIM Mid Cap", amount: 20000, type: "SIP" },
  { name: "Quant Multi Cap", amount: 15000, type: "SIP" },
  { name: "Bandhan Small Cap", amount: 5000, type: "SIP" },
  { name: "US stock and ETF", amount: 10000, type: "SIP" },
  { name: "HDFC gold ETF", amount: 5000, type: "SIP" },
  { name: "Kotaj Arbitrage Fund", amount: 3500, type: "SIP" },
  { name: "EMI", amount: 12000, type: "EMI" },
  { name: "Expense", amount: 35000, type: "EXPENSE" }
];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  let allocations = await prisma.budgetAllocation.findMany({
    where: { userId },
    orderBy: [{ type: "asc" }, { name: "asc" }]
  });

  if (allocations.length === 0) {
    const dataToCreate = DEFAULT_BUDGET.map(item => ({
      ...item,
      userId
    }));

    await prisma.budgetAllocation.createMany({
      data: dataToCreate,
      skipDuplicates: true
    });

    allocations = await prisma.budgetAllocation.findMany({
      where: { userId },
      orderBy: [{ type: "asc" }, { name: "asc" }]
    });
  }

  return NextResponse.json(allocations);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, amount, type } = body;

    if (!name || !amount || !type) {
      return NextResponse.json({ error: "Name, amount, and type are required" }, { status: 400 });
    }

    const allocation = await prisma.budgetAllocation.create({
      data: {
        name,
        amount: Number(amount),
        type,
        userId: session.user.id
      }
    });

    return NextResponse.json(allocation, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create" }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, name, amount, type } = body;

    if (!id || !name || !amount || !type) {
      return NextResponse.json({ error: "ID, name, amount, and type are required" }, { status: 400 });
    }

    const updated = await prisma.budgetAllocation.update({
      where: {
        id,
        userId: session.user.id
      },
      data: {
        name,
        amount: Number(amount),
        type
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.budgetAllocation.delete({
      where: {
        id,
        userId: session.user.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete" }, { status: 400 });
  }
}
