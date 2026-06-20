import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import VehicleClient from "@/features/vehicle/components/VehicleClient";

export default async function VehiclePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const expenses = await prisma.vehicleExpense.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
  });

  return (
    <VehicleClient
      initialExpenses={expenses.map((e) => ({
        ...e,
        date: e.date.toISOString(),
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
      }))}
    />
  );
}
