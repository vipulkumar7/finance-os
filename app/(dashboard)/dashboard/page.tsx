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

  // Fetch all dashboard data concurrently
  const [
    currentMonthExpenses,
    lastMonthExpenses,
    todayExpenses,
    yearExpenses,
    recentExpenses,
    yearInvestments,
    latestNetWorth,
    previousNetWorth,
    goals,
  ] = await Promise.all([
    prisma.expense.findMany({
      where: { userId, date: { gte: monthStart, lte: monthEnd } },
      orderBy: { date: "desc" },
    }),
    prisma.expense.findMany({
      where: { userId, date: { gte: lastMonthStart, lte: lastMonthEnd } },
    }),
    prisma.expense.findMany({
      where: { userId, date: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.expense.findMany({
      where: { userId, date: { gte: yearStart, lte: yearEnd } },
      orderBy: { date: "asc" },
    }),
    prisma.expense.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 5,
    }),
    prisma.investmentEntry.findMany({
      where: { userId, year: now.getFullYear() },
      orderBy: [{ month: "asc" }],
    }),
    prisma.netWorthSnapshot.findFirst({
      where: { userId },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    }),
    prisma.netWorthSnapshot.findFirst({
      where: { userId },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      skip: 1,
    }),
    prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // Compute aggregates
  const totalMonthSpent = currentMonthExpenses.reduce(
    (s: any, e: { amount: any }) => s + e.amount,
    0,
  );
  const totalLastMonthSpent = lastMonthExpenses.reduce(
    (s: any, e: { amount: any }) => s + e.amount,
    0,
  );
  const totalTodaySpent = todayExpenses.reduce(
    (s: any, e: { amount: any }) => s + e.amount,
    0,
  );
  const daysInMonth = now.getDate();
  const dailyAverage =
    daysInMonth > 0 ? Math.round(totalMonthSpent / daysInMonth) : 0;

  // Category breakdown
  const categoryBreakdown: Record<string, number> = {};
  currentMonthExpenses.forEach((e: any) => {
    categoryBreakdown[e.category] =
      (categoryBreakdown[e.category] || 0) + e.amount;
  });

  // Payment mode breakdown
  const paymentBreakdown: Record<string, number> = {};
  currentMonthExpenses.forEach((e: any) => {
    paymentBreakdown[e.paymentMode] =
      (paymentBreakdown[e.paymentMode] || 0) + e.amount;
  });

  // Top category
  const topCategory = Object.entries(categoryBreakdown).sort(
    (a, b) => b[1] - a[1],
  )[0];

  // Top payment mode
  const topPaymentMode = Object.entries(paymentBreakdown).sort(
    (a: any, b: any) => b[1] - a[1],
  )[0];

  // Yearly calculations
  // Yearly calculations
  const totalYearSpent = yearExpenses.reduce(
    (s: any, e: { amount: any }) => s + e.amount,
    0,
  );
  const startOfYearDate = new Date(now.getFullYear(), 0, 1);
  const diffTime = Math.abs(now.getTime() - startOfYearDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  const yearDailyAverage = Math.round(totalYearSpent / diffDays);

  const yearCategoryBreakdown: Record<string, number> = {};
  yearExpenses.forEach((e: any) => {
    yearCategoryBreakdown[e.category] =
      (yearCategoryBreakdown[e.category] || 0) + e.amount;
  });

  const yearPaymentBreakdown: Record<string, number> = {};
  yearExpenses.forEach((e: any) => {
    yearPaymentBreakdown[e.paymentMode] =
      (yearPaymentBreakdown[e.paymentMode] || 0) + e.amount;
  });

  const topYearCategory = Object.entries(yearCategoryBreakdown).sort(
    (a: any, b: any) => b[1] - a[1],
  )[0];
  const topYearPaymentMode = Object.entries(yearPaymentBreakdown).sort(
    (a: any, b: any) => b[1] - a[1],
  )[0];

  // Monthly trend (last 6 months)
  const monthlyTrend: { month: string; amount: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(now, i);
    const ms = startOfMonth(d);
    const me = endOfMonth(d);
    const monthExpenses = yearExpenses.filter(
      (e: any) => new Date(e.date) >= ms && new Date(e.date) <= me,
    );
    const total = monthExpenses.reduce(
      (s: any, e: { amount: any }) => s + e.amount,
      0,
    );
    monthlyTrend.push({
      month: d.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      amount: total,
    });
  }

  // Year investments total
  const totalYearInvestment = yearInvestments.reduce(
    (
      s: any,
      inv: {
        mutualFundInvestment: any;
        stockInvestment: any;
        fdInvestment: any;
        arbitrageInvestment: any;
        liquidFundInvestment: any;
        npsContribution: any;
        epfContribution: any;
        goldInvestment: any;
      },
    ) => {
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
    },
    0,
  );

  // Month spending percentage change
  const monthChange =
    totalLastMonthSpent > 0
      ? Math.round(
          ((totalMonthSpent - totalLastMonthSpent) / totalLastMonthSpent) * 100,
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
    totalYearSpent,
    yearDailyAverage,
    yearCategoryBreakdown,
    yearPaymentBreakdown,
    topYearCategory: topYearCategory
      ? { category: topYearCategory[0], amount: topYearCategory[1] }
      : null,
    topYearPaymentMode: topYearPaymentMode
      ? { mode: topYearPaymentMode[0], amount: topYearPaymentMode[1] }
      : null,
    monthlyTrend,
    recentExpenses: recentExpenses.map((e: any) => ({
      id: e.id,
      item: e.item,
      amount: e.amount,
      category: e.category,
      paymentMode: e.paymentMode,
      date: e.date.toISOString(),
    })),
    totalYearInvestment,
    yearInvestments: yearInvestments.map(
      (inv: {
        month: any;
        year: any;
        mutualFundInvestment: any;
        stockInvestment: any;
        fdInvestment: any;
        arbitrageInvestment: any;
        liquidFundInvestment: any;
        npsContribution: any;
        epfContribution: any;
        goldInvestment: any;
      }) => ({
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
      }),
    ),
    netWorth: latestNetWorth?.netWorth || 0,
    netWorthChange:
      latestNetWorth && previousNetWorth
        ? latestNetWorth.netWorth - previousNetWorth.netWorth
        : 0,
    goals: goals.map((g: any) => ({
      id: g.id,
      name: g.name,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      icon: g.icon,
      progress:
        g.targetAmount > 0
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
