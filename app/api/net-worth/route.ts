import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { netWorthSchema } from "@/lib/validations/schemas";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snapshots = await prisma.netWorthSnapshot.findMany({
    where: { userId: session.user.id },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  return NextResponse.json(snapshots);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = netWorthSchema.parse(body);

    const totalAssets =
      validated.mutualFundsValue +
      validated.stocksValue +
      validated.epfValue +
      validated.npsValue +
      validated.fdValue +
      validated.liquidFundValue +
      validated.arbitrageFundValue +
      validated.savingsAccountValue +
      validated.goldValue;

    const totalLiabilities =
      validated.personalLoan + validated.homeLoan + validated.otherLoan;

    const netWorth = totalAssets - totalLiabilities;

    const snapshot = await prisma.netWorthSnapshot.upsert({
      where: {
        month_year_userId: {
          month: validated.month,
          year: validated.year,
          userId: session.user.id,
        },
      },
      update: { ...validated, totalAssets, totalLiabilities, netWorth },
      create: {
        ...validated,
        totalAssets,
        totalLiabilities,
        netWorth,
        userId: session.user.id,
      },
    });

    return NextResponse.json(snapshot, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Invalid data" }, { status: 400 });
  }
}
