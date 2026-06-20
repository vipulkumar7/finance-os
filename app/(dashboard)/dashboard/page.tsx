import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import DashboardClient from "@/features/dashboard/components/DashboardClient";
import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
  startOfDay,
  endOfDay,
} from "date-fns";

async function getDashboardData(userId: string) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const yearStart = startOfYear(now);
  const yearEnd = endOfYear(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  // Current month expenses
  const currentMonthExpenses = await prisma.expense.findMany({
    where: { userId, date: { gte: monthStart, lte: monthEnd } },
    orderBy: { date: "desc" },
  });

  // Last month expenses (for comparison)
  const lastMonthExpenses = await prisma.expense.findMany({
    where: { userId, date: { gte: lastMonthStart, lte: lastMonthEnd } },
  });

  // Today's expenses
  const todayExpenses = await prisma.expense.findMany({
    where: { userId, date: { gte: todayStart, lte: todayEnd } },
  });

  // This year expenses (monthly aggregation)
  const yearExpenses = await prisma.expense.findMany({
    where: { userId, date: { gte: yearStart, lte: yearEnd } },
    orderBy: { date: "asc" },
  });

  // Recent expenses (last 5)
  const recentExpenses = await prisma.expense.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 5,
  });

  // Current year investments
  const yearInvestments = await prisma.investmentEntry.findMany({
    where: { userId, year: now.getFullYear() },
    orderBy: [{ month: "asc" }],
  });

  // Latest net worth
  const latestNetWorth = await prisma.netWorthSnapshot.findFirst({
    where: { userId },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  // Previous net worth (for comparison)
  const previousNetWorth = await prisma.netWorthSnapshot.findFirst({
    where: { userId },
    orderBy: [{ year: "desc" }, { month: "desc" }],
    skip: 1,
  });

  // Goals
  const goals = await prisma.goal.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  // Compute aggregates
  const totalMonthSpent = currentMonthExpenses.reduce((s, e) => s + e.amount, 0);
  const totalLastMonthSpent = lastMonthExpenses.reduce((s, e) => s + e.amount, 0);
  const totalTodaySpent = todayExpenses.reduce((s, e) => s + e.amount, 0);
  const daysInMonth = now.getDate();
  const dailyAverage = daysInMonth > 0 ? Math.round(totalMonthSpent / daysInMonth) : 0;

  // Category breakdown
  const categoryBreakdown: Record<string, number> = {};
  currentMonthExpenses.forEach((e) => {
    categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + e.amount;
  });

  // Payment mode breakdown
  const paymentBreakdown: Record<string, number> = {};
  currentMonthExpenses.forEach((e) => {
    paymentBreakdown[e.paymentMode] = (paymentBreakdown[e.paymentMode] || 0) + e.amount;
  });

  // Top category
  const topCategory = Object.entries(categoryBreakdown).sort(
    (a, b) => b[1] - a[1]
  )[0];

  // Top payment mode
  const topPaymentMode = Object.entries(paymentBreakdown).sort(
    (a, b) => b[1] - a[1]
  )[0];

  // Monthly trend (last 6 months)
  const monthlyTrend: { month: string; amount: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(now, i);
    const ms = startOfMonth(d);
    const me = endOfMonth(d);
    const monthExpenses = yearExpenses.filter(
      (e) => new Date(e.date) >= ms && new Date(e.date) <= me
    );
    const total = monthExpenses.reduce((s, e) => s + e.amount, 0);
    monthlyTrend.push({
      month: d.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      amount: total,
    });
  }

  // Year investments total
  const totalYearInvestment = yearInvestments.reduce((s, inv) => {
    return (
      s +
      inv.mutualFundInvestment +
      inv.stockInvestment +
      inv.fdInvestment +
      inv.arbitrageInvestment +
      inv.liquidFundInvestment +
      inv.npsContribution +
      inv.epfContribution +
      inv.goldInvestment
    );
  }, 0);

  // Month spending percentage change
  const monthChange =
    totalLastMonthSpent > 0
      ? Math.round(
          ((totalMonthSpent - totalLastMonthSpent) / totalLastMonthSpent) * 100
        )
      : 0;

  return {
    totalMonthSpent,
    totalLastMonthSpent,
    totalTodaySpent,
    dailyAverage,
    monthChange,
    categoryBreakdown,
    paymentBreakdown,
    topCategory: topCategory
      ? { category: topCategory[0], amount: topCategory[1] }
      : null,
    topPaymentMode: topPaymentMode
      ? { mode: topPaymentMode[0], amount: topPaymentMode[1] }
      : null,
    monthlyTrend,
    recentExpenses: recentExpenses.map((e) => ({
      id: e.id,
      item: e.item,
      amount: e.amount,
      category: e.category,
      paymentMode: e.paymentMode,
      date: e.date.toISOString(),
    })),
    totalYearInvestment,
    yearInvestments: yearInvestments.map((inv) => ({
      month: inv.month,
      year: inv.year,
      total:
        inv.mutualFundInvestment +
        inv.stockInvestment +
        inv.fdInvestment +
        inv.arbitrageInvestment +
        inv.liquidFundInvestment +
        inv.npsContribution +
        inv.epfContribution +
        inv.goldInvestment,
    })),
    netWorth: latestNetWorth?.netWorth || 0,
    netWorthChange: latestNetWorth && previousNetWorth
      ? latestNetWorth.netWorth - previousNetWorth.netWorth
      : 0,
    goals: goals.map((g) => ({
      id: g.id,
      name: g.name,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      icon: g.icon,
      progress: g.targetAmount > 0
        ? Math.round((g.currentAmount / g.targetAmount) * 100)
        : 0,
    })),
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const data = await getDashboardData(session.user.id);

  return <DashboardClient data={data} />;
}
