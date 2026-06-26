import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

const DEFAULT_CARDS = [
  "SBI Cashback Credit Card",
  "HDFC Regalia Gold Credit Card",
  "HDFC UPI RuPay Credit Card",
  "Yes Bank Ace Credit Card",
  "HDFC Millennia Debit Card"
];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Fetch current rewards
  let rewards = await prisma.cardReward.findMany({
    where: { userId },
    orderBy: { cardName: "asc" }
  });

  // If no rewards have been initialized, create the default list
  if (rewards.length === 0) {
    const dataToCreate = DEFAULT_CARDS.map(cardName => ({
      cardName,
      points: 0,
      valueInInr: 0,
      userId
    }));

    await prisma.cardReward.createMany({
      data: dataToCreate,
      skipDuplicates: true
    });

    rewards = await prisma.cardReward.findMany({
      where: { userId },
      orderBy: { cardName: "asc" }
    });
  }

  return NextResponse.json(rewards);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, points, valueInInr, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Card ID is required" }, { status: 400 });
    }

    const updated = await prisma.cardReward.update({
      where: {
        id,
        userId: session.user.id
      },
      data: {
        points: Number(points),
        valueInInr: Number(valueInInr),
        notes: notes || null
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update" }, { status: 400 });
  }
}
