import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { investmentSchema } from "@/lib/validations/schemas";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

  const investments = await prisma.investmentEntry.findMany({
    where: { userId: session.user.id, year },
    orderBy: { month: "asc" },
  });

  return NextResponse.json(investments);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = investmentSchema.parse(body);

    const investment = await prisma.investmentEntry.upsert({
      where: {
        month_year_userId: {
          month: validated.month,
          year: validated.year,
          userId: session.user.id,
        },
      },
      update: validated,
      create: { ...validated, userId: session.user.id },
    });

    return NextResponse.json(investment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Invalid data" }, { status: 400 });
  }
}
