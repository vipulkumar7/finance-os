import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { netWorthSchema } from "@/lib/validations/schemas";

// PUT /api/net-worth/[id]
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
    const validated = netWorthSchema.parse(body);

    // Verify ownership
    const existing = await prisma.netWorthSnapshot.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const totalAssets =
      validated.mutualFundsValue +
      validated.stocksValue +
      validated.epfValue +
      validated.npsValue +
      validated.fdValue +
      validated.liquidFundValue +
      validated.arbitrageFundValue +
      validated.savingsAccountValue +
      validated.goldValue +
      validated.cryptoValue +
      validated.lentAmount;

    const totalLiabilities =
      validated.personalLoan + validated.homeLoan + validated.otherLoan;

    const netWorth = totalAssets - totalLiabilities;

    const updated = await prisma.netWorthSnapshot.update({
      where: { id },
      data: {
        ...validated,
        totalAssets,
        totalLiabilities,
        netWorth,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Invalid data" },
      { status: 400 }
    );
  }
}

// DELETE /api/net-worth/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify ownership
  const existing = await prisma.netWorthSnapshot.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.netWorthSnapshot.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
