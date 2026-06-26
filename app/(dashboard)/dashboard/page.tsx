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
export interface DashboardExpense {
  id: string;
  date: Date;
  item: string;
  amount: number;
  category: any; // Use any or string to support prisma enums without namespace imports
  paymentMode: any;
}

export interface DashboardInvestment {
  month: number;
  year: number;
  mutualFundInvestment: number;
  stockInvestment: number;
  fdInvestment: number;
  arbitrageInvestment: number;
  liquidFundInvestment: number;
  npsContribution: number;
  epfContribution: number;
  goldInvestment: number;
}

async function getDashboardData(
  userId: string,
  selectedYear: number,
  selectedMonth: number,
) {
  const now = new Date();

  // selectedMonth is 0-indexed (0 = Jan, 11 = Dec)
  const monthStart = new Date(Date.UTC(selectedYear, selectedMonth, 1));
  const monthEnd = new Date(Date.UTC(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999));
  const yearStart = new Date(Date.UTC(selectedYear, 0, 1));
  const yearEnd = new Date(Date.UTC(selectedYear, 11, 31, 23, 59, 59, 999));

  const lastMonthYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
  const lastMonthIdx = selectedMonth === 0 ? 11 : selectedMonth - 1;
  const lastMonthStart = new Date(Date.UTC(lastMonthYear, lastMonthIdx, 1));
  const lastMonthEnd = new Date(Date.UTC(lastMonthYear, lastMonthIdx + 1, 0, 23, 59, 59, 999));

  const isCurrentMonth =
    selectedYear === now.getFullYear() && selectedMonth === now.getMonth();
  const todayStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const todayEnd = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999));

  // Find dynamic list of years with data
  const oldestExpense = await prisma.expense.findFirst({
    where: { userId },
    orderBy: { date: "asc" },
    select: { date: true },
  });
  const newestExpense = await prisma.expense.findFirst({
    where: { userId },
    orderBy: { date: "desc" },
    select: { date: true },
  });

  const currentYear = now.getFullYear();
  const startYear = oldestExpense
    ? oldestExpense.date.getFullYear()
    : currentYear - 1;
  const endYear = newestExpense
    ? newestExpense.date.getFullYear()
    : currentYear;

  const availableYears = [];
  for (let y = startYear; y <= Math.max(endYear, currentYear); y++) {
    availableYears.push(y);
  }

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
    budgetAllocations,
  ] = await Promise.all([
    prisma.expense.findMany({
      where: { userId, date: { gte: monthStart, lte: monthEnd } },
      orderBy: { date: "desc" },
    }),
    prisma.expense.findMany({
      where: { userId, date: { gte: lastMonthStart, lte: lastMonthEnd } },
    }),
    isCurrentMonth
      ? prisma.expense.findMany({
          where: { userId, date: { gte: todayStart, lte: todayEnd } },
        })
      : Promise.resolve([]),
    prisma.expense.findMany({
      where: { userId, date: { gte: yearStart, lte: yearEnd } },
      orderBy: { date: "asc" },
    }),
    prisma.expense.findMany({
      where: { userId, date: { gte: yearStart, lte: yearEnd } },
      orderBy: { date: "desc" },
      take: 5,
    }),
    prisma.investmentEntry.findMany({
      where: { userId, year: selectedYear },
      orderBy: [{ month: "asc" }],
    }),
    prisma.netWorthSnapshot.findFirst({
      where: {
        userId,
        OR: [
          { year: { lt: selectedYear } },
          { year: selectedYear, month: { lte: selectedMonth + 1 } },
        ],
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    }),
    prisma.netWorthSnapshot.findFirst({
      where: {
        userId,
        OR: [
          { year: { lt: selectedYear } },
          { year: selectedYear, month: { lte: selectedMonth } },
        ],
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    }),
    prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.budgetAllocation.findMany({
      where: { userId },
    }),
  ]);

  // Compute aggregates
  const totalMonthSpent = currentMonthExpenses.reduce(
    (s: number, e: DashboardExpense) => s + e.amount,
    0,
  );
  const totalLastMonthSpent = lastMonthExpenses.reduce(
    (s: number, e: DashboardExpense) => s + e.amount,
    0,
  );
  const totalTodaySpent = todayExpenses.reduce(
    (s: number, e: DashboardExpense) => s + e.amount,
    0,
  );

  const daysInMonth = isCurrentMonth
    ? now.getDate()
    : new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const dailyAverage =
    daysInMonth > 0 ? Math.round(totalMonthSpent / daysInMonth) : 0;

  // Category breakdown
  const categoryBreakdown: Record<string, number> = {};
  currentMonthExpenses.forEach((e: DashboardExpense) => {
    categoryBreakdown[e.category] =
      (categoryBreakdown[e.category] || 0) + e.amount;
  });

  // Payment mode breakdown
  const paymentBreakdown: Record<string, number> = {};
  currentMonthExpenses.forEach((e: DashboardExpense) => {
    paymentBreakdown[e.paymentMode] =
      (paymentBreakdown[e.paymentMode] || 0) + e.amount;
  });

  // Top category
  const topCategory = Object.entries(categoryBreakdown).sort(
    (a, b) => b[1] - a[1],
  )[0];

  // Top payment mode
  const topPaymentMode = Object.entries(paymentBreakdown).sort(
    (a, b) => b[1] - a[1],
  )[0];

  // Yearly calculations
  const totalYearSpent = yearExpenses.reduce(
    (s: number, e: DashboardExpense) => s + e.amount,
    0,
  );

  const isCurrentYear = selectedYear === now.getFullYear();
  let diffDays = 365;
  if (isCurrentYear) {
    const startOfYearDate = new Date(selectedYear, 0, 1);
    const diffTime = Math.abs(now.getTime() - startOfYearDate.getTime());
    diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  } else {
    const isLeap =
      (selectedYear % 4 === 0 && selectedYear % 100 !== 0) ||
      selectedYear % 400 === 0;
    diffDays = isLeap ? 366 : 365;
  }
  const yearDailyAverage = Math.round(totalYearSpent / diffDays);

  const yearCategoryBreakdown: Record<string, number> = {};
  yearExpenses.forEach((e: DashboardExpense) => {
    yearCategoryBreakdown[e.category] =
      (yearCategoryBreakdown[e.category] || 0) + e.amount;
  });

  const yearPaymentBreakdown: Record<string, number> = {};
  yearExpenses.forEach((e: DashboardExpense) => {
    yearPaymentBreakdown[e.paymentMode] =
      (yearPaymentBreakdown[e.paymentMode] || 0) + e.amount;
  });

  const topYearCategory = Object.entries(yearCategoryBreakdown).sort(
    (a, b) => b[1] - a[1],
  )[0];
  const topYearPaymentMode = Object.entries(yearPaymentBreakdown).sort(
    (a, b) => b[1] - a[1],
  )[0];

  // Monthly trend (all 12 months of the selected year)
  const monthlyTrend: { month: string; amount: number }[] = [];
  for (let m = 0; m < 12; m++) {
    const ms = new Date(Date.UTC(selectedYear, m, 1));
    const me = new Date(Date.UTC(selectedYear, m + 1, 0, 23, 59, 59, 999));
    const monthExpenses = yearExpenses.filter(
      (e: DashboardExpense) => {
        const utcDate = new Date(e.date);
        return utcDate >= ms && utcDate <= me;
      }
    );
    const total = monthExpenses.reduce(
      (s: number, e: DashboardExpense) => s + e.amount,
      0,
    );
    monthlyTrend.push({
      month: new Date(Date.UTC(selectedYear, m, 15)).toLocaleDateString("en-IN", { month: "short", timeZone: "UTC" }),
      amount: total,
    });
  }

  // Monthly SIP budget target
  const INVESTMENT_TYPES = [
    "sip",
    "mutual funds",
    "stocks",
    "fd",
    "nps",
    "epf",
    "gold",
    "arbitrage",
    "liquid fund",
  ];

  const totalYearInvestment = budgetAllocations
    .filter((b: any) => INVESTMENT_TYPES.includes(b.type.toLowerCase()))
    .reduce((sum: number, b: any) => sum + b.amount, 0);

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
    recentExpenses: recentExpenses.map((e: DashboardExpense) => ({
      id: e.id,
      item: e.item,
      amount: e.amount,
      category: e.category,
      paymentMode: e.paymentMode,
      date: e.date.toISOString(),
    })),
    totalYearInvestment,
    yearInvestments: yearInvestments.map((inv: DashboardInvestment) => ({
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
    selectedYear,
    selectedMonth,
    availableYears,
  };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams:
    | Promise<{ year?: string; month?: string }>
    | { year?: string; month?: string };
}) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  // Query latest expense to find the default year/month if not provided
  const newestExpense = await prisma.expense.findFirst({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    select: { date: true },
  });

  const now = new Date();
  const defaultYear = newestExpense
    ? newestExpense.date.getFullYear()
    : now.getFullYear();
  const defaultMonth = newestExpense
    ? newestExpense.date.getMonth()
    : now.getMonth();

  const selectedYear = params?.year ? parseInt(params.year, 10) : defaultYear;
  const selectedMonth = params?.month
    ? parseInt(params.month, 10)
    : defaultMonth;

  const data = await getDashboardData(
    session.user.id,
    selectedYear,
    selectedMonth,
  );

  return <DashboardClient data={data} />;
}
