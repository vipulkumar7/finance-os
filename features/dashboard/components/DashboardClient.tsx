"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  CreditCard,
  Tag,
  Calendar,
  ChevronDown,
  Sparkles,
  Award,
  Target,
} from "lucide-react";
import {
  formatCurrency,
  formatCompactCurrency,
  CATEGORY_CONFIG,
  PAYMENT_MODE_CONFIG,
  formatDateShort,
  getMonthName,
  getGreeting,
} from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from "recharts";
import Link from "next/link";

interface DashboardData {
  totalMonthSpent: number;
  totalLastMonthSpent: number;
  totalTodaySpent: number;
  dailyAverage: number;
  monthChange: number;
  categoryBreakdown: Record<string, number>;
  paymentBreakdown: Record<string, number>;
  topCategory: { category: string; amount: number } | null;
  topPaymentMode: { mode: string; amount: number } | null;
  totalYearSpent: number;
  yearDailyAverage: number;
  yearCategoryBreakdown: Record<string, number>;
  yearPaymentBreakdown: Record<string, number>;
  topYearCategory: { category: string; amount: number } | null;
  topYearPaymentMode: { mode: string; amount: number } | null;
  monthlyTrend: { month: string; amount: number }[];
  recentExpenses: {
    id: string;
    item: string;
    amount: number;
    category: string;
    paymentMode: string;
    date: string;
  }[];
  totalYearInvestment: number;
  yearInvestments: { month: number; year: number; total: number }[];
  netWorth: number;
  netWorthChange: number;
  goals: {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    icon: string;
    progress: number;
  }[];
  selectedYear: number;
  selectedMonth: number;
  availableYears: number[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as any } },
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/95 px-3 py-2 shadow-2xl backdrop-blur-md text-xs">
      <p className="text-[var(--text-muted)] font-medium mb-0.5">{label}</p>
      <p className="text-white font-extrabold text-sm">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

export default function DashboardClient({ data }: { data: DashboardData }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [timeframe, setTimeframe] = useState<"month" | "year">("month");

  const activeBreakdown =
    timeframe === "month" ? data.categoryBreakdown : data.yearCategoryBreakdown;
  const activePaymentBreakdown =
    timeframe === "month" ? data.paymentBreakdown : data.yearPaymentBreakdown;
  const activeTotal =
    timeframe === "month" ? data.totalMonthSpent : data.totalYearSpent;
  const activeDailyAverage =
    timeframe === "month" ? data.dailyAverage : data.yearDailyAverage;
  const activeTopCategory =
    timeframe === "month" ? data.topCategory : data.topYearCategory;
  const activeTopPaymentMode =
    timeframe === "month" ? data.topPaymentMode : data.topYearPaymentMode;

  const handleYearChange = (newYear: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", newYear);
    router.push(`?${params.toString()}`);
  };

  const handleMonthChange = (newMonth: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", newMonth);
    router.push(`?${params.toString()}`);
  };

  const categoryData = Object.entries(activeBreakdown)
    .map(([key, value]) => ({
      name: CATEGORY_CONFIG[key]?.label || key,
      value,
      color: CATEGORY_CONFIG[key]?.color || "#6b7280",
    }))
    .sort((a, b) => b.value - a.value);

  const paymentData = Object.entries(activePaymentBreakdown)
    .map(([key, value]) => ({
      name: PAYMENT_MODE_CONFIG[key]?.label || key,
      value,
      color: PAYMENT_MODE_CONFIG[key]?.color || "#6b7280",
    }))
    .sort((a, b) => b.value - a.value);

  const hasData = activeTotal > 0 || data.recentExpenses.length > 0;
  const currentMonthName = getMonthName(data.selectedMonth + 1);

  const activeTrendMonths = data.monthlyTrend.filter((m) => m.amount > 0);
  const averageMonthlySpent = activeTrendMonths.length > 0
    ? activeTrendMonths.reduce((s, m) => s + m.amount, 0) / activeTrendMonths.length
    : 0;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto"
    >
      {/* Timeframe Toggle Header */}
      <motion.div
        variants={item}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5"
      >
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-6 rounded bg-gradient-to-b from-emerald-400 to-teal-500 inline-block" />
            <span>{getGreeting()}, Welcome back</span>
          </h2>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-1">
            Personal financial insights & wealth tracking overview
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Year selector */}
          <div className="relative flex items-center bg-zinc-950 border border-zinc-900 px-3.5 py-1.5 rounded-xl transition-colors hover:border-zinc-800">
            <Calendar className="w-3.5 h-3.5 text-zinc-500 mr-2" />
            <select
              value={data.selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-white outline-none border-none cursor-pointer pr-4 appearance-none relative z-10"
            >
              {data.availableYears.map((y) => (
                <option key={y} value={y} className="bg-zinc-950">
                  {y}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-zinc-500 absolute right-3 pointer-events-none" />
          </div>

          {/* Month selector */}
          {timeframe === "month" && (
            <div className="relative flex items-center bg-zinc-950 border border-zinc-900 px-3.5 py-1.5 rounded-xl transition-colors hover:border-zinc-800">
              <Calendar className="w-3.5 h-3.5 text-zinc-500 mr-2" />
              <select
                value={data.selectedMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="bg-transparent text-xs font-bold text-white outline-none border-none cursor-pointer pr-4 appearance-none relative z-10"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i} value={i} className="bg-zinc-950">
                    {getMonthName(i + 1)}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-zinc-500 absolute right-3 pointer-events-none" />
            </div>
          )}

          {/* Timeframe switch */}
          <div className="flex items-center bg-zinc-950 border border-zinc-900 p-1 rounded-xl shadow-inner">
            <button
              onClick={() => setTimeframe("month")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all duration-200 ${
                timeframe === "month"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeframe("year")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all duration-200 ${
                timeframe === "year"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              Year
            </button>
          </div>
        </div>
      </motion.div>

      {/* ===== TOP METRIC CARDS ===== */}
      <motion.div
        variants={item}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Total Spent */}
        <motion.div
          whileHover={{ y: -3, borderColor: "rgba(16, 185, 129, 0.25)" }}
          className="relative overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950/60 p-5 transition-all group metric-accent-green"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/[0.02] rounded-full blur-2xl group-hover:bg-emerald-500/[0.04] transition-colors" />
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider truncate">
              Spent ({timeframe === "month" ? `${currentMonthName}` : data.selectedYear})
            </span>
          </div>
          <p className="text-xl md:text-2xl font-black text-white tracking-tight">
            {formatCurrency(activeTotal)}
          </p>
          {timeframe === "month" && data.monthChange !== 0 && (
            <div className="flex items-center gap-1 mt-2">
              {data.monthChange > 0 ? (
                <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span
                className={`text-[10px] font-bold ${
                  data.monthChange > 0 ? "text-rose-400" : "text-emerald-400"
                }`}
              >
                {data.monthChange > 0 ? "+" : ""}
                {data.monthChange}% vs last Mo
              </span>
            </div>
          )}
        </motion.div>

        {/* Daily Average */}
        <motion.div
          whileHover={{ y: -3, borderColor: "rgba(59, 130, 246, 0.25)" }}
          className="relative overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950/60 p-5 transition-all group metric-accent-blue"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/[0.02] rounded-full blur-2xl group-hover:bg-blue-500/[0.04] transition-colors" />
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Calendar className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider truncate">
              Daily Avg ({timeframe === "month" ? `${currentMonthName}` : data.selectedYear})
            </span>
          </div>
          <p className="text-xl md:text-2xl font-black text-white tracking-tight">
            {formatCurrency(activeDailyAverage)}
          </p>
          {timeframe === "month" && (
            <p className="text-[10px] text-zinc-500 mt-2 font-bold uppercase">
              Today: <span className="text-zinc-200">{formatCurrency(data.totalTodaySpent)}</span>
            </p>
          )}
        </motion.div>

        {/* Top Category */}
        <motion.div
          whileHover={{ y: -3, borderColor: "rgba(139, 92, 246, 0.25)" }}
          className="relative overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950/60 p-5 transition-all group metric-accent-purple"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/[0.02] rounded-full blur-2xl group-hover:bg-purple-500/[0.04] transition-colors" />
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <Tag className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider truncate">
              Top Category
            </span>
          </div>
          <p className="text-lg md:text-xl font-black text-white truncate tracking-tight">
            {activeTopCategory
              ? CATEGORY_CONFIG[activeTopCategory.category]?.label || "—"
              : "—"}
          </p>
          {activeTopCategory && (
            <p className="text-[10px] text-purple-400 mt-2 font-bold uppercase">
              {formatCurrency(activeTopCategory.amount)}{" "}
              <span className="text-zinc-500 font-normal">
                ({activeTotal > 0 ? Math.round((activeTopCategory.amount / activeTotal) * 100) : 0}%)
              </span>
            </p>
          )}
        </motion.div>

        {/* Top Payment Mode */}
        <motion.div
          whileHover={{ y: -3, borderColor: "rgba(245, 158, 11, 0.25)" }}
          className="relative overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950/60 p-5 transition-all group metric-accent-amber"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/[0.02] rounded-full blur-2xl group-hover:bg-amber-500/[0.04] transition-colors" />
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <CreditCard className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider truncate">
              Top Payment Mode
            </span>
          </div>
          <p className="text-lg md:text-xl font-black text-white truncate tracking-tight">
            {activeTopPaymentMode
              ? PAYMENT_MODE_CONFIG[activeTopPaymentMode.mode]?.label || "—"
              : "—"}
          </p>
          {activeTopPaymentMode && (
            <p className="text-[10px] text-amber-400 mt-2 font-bold uppercase">
              {formatCurrency(activeTopPaymentMode.amount)}{" "}
              <span className="text-zinc-500 font-normal">
                ({activeTotal > 0 ? Math.round((activeTopPaymentMode.amount / activeTotal) * 100) : 0}%)
              </span>
            </p>
          )}
        </motion.div>
      </motion.div>

      {/* ===== CHARTS ROW ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Spending Trend */}
        <motion.div
          variants={item}
          className="lg:col-span-1 border border-zinc-900 bg-zinc-950/60 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/[0.01] rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-xs uppercase tracking-wider font-bold text-zinc-400">
              Monthly Spending Trend
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[var(--text-muted)]">
              This Year
            </span>
          </div>

          {hasData ? (
            <div className="relative z-10 flex-grow flex flex-col justify-between">
              <div>
                <p className="text-2xl font-black text-white tracking-tight mb-0.5">
                  {formatCurrency(data.monthlyTrend.reduce((s, m) => s + m.amount, 0))}
                </p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-4">
                  Total till date
                </p>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.monthlyTrend} margin={{ top: 10, right: 5, left: 0, bottom: -5 }}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.02)" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 9, fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} width={45} tick={{ fill: "#6b7280", fontSize: 9, fontWeight: 600 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(16, 185, 129, 0.15)", strokeWidth: 1, strokeDasharray: "4 4" }} />
                    {averageMonthlySpent > 0 && (
                      <ReferenceLine
                        y={averageMonthlySpent}
                        stroke="rgba(245, 158, 11, 0.3)"
                        strokeDasharray="3 3"
                        strokeWidth={1.5}
                        label={{
                          value: `Avg: ${formatCompactCurrency(averageMonthlySpent)}`,
                          fill: "#f59e0b",
                          fontSize: 8,
                          fontWeight: 700,
                          position: "top",
                          offset: 4,
                        }}
                      />
                    )}
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#colorAmount)"
                      dot={false}
                      activeDot={{ r: 4, fill: "#10b981", stroke: "#0a0a0f", strokeWidth: 1.5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <EmptyChart message="Add expenses to see spending trends" />
          )}
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          variants={item}
          className="lg:col-span-1 border border-zinc-900 bg-zinc-950/60 rounded-2xl p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs uppercase tracking-wider font-bold text-zinc-400">
              Category Breakdown
            </h3>
          </div>

          {categoryData.length > 0 ? (
            <div className="flex flex-col items-center flex-grow justify-between">
              <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) =>
                        active && payload?.[0] ? (
                          <div className="rounded-xl border border-zinc-800 bg-zinc-950/95 px-3 py-2 shadow-2xl backdrop-blur-md text-xs">
                            <p className="text-[var(--text-muted)] font-medium">
                              {payload[0].name}
                            </p>
                            <p className="text-white font-bold text-sm">
                              {formatCurrency(payload[0].value as number)}
                            </p>
                          </div>
                        ) : null
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Total</p>
                  <p className="text-base font-black text-white tracking-tight">
                    {formatCompactCurrency(activeTotal)}
                  </p>
                </div>
              </div>

              {/* Legend */}
              <div className="w-full space-y-2 mt-4 max-h-[120px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
                {categoryData.slice(0, 10).map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between text-xs py-0.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: cat.color }} />
                      <span className="text-[var(--text-secondary)] font-medium">{cat.name}</span>
                    </div>
                    <span className="text-white font-semibold">
                      {formatCurrency(cat.value)}{" "}
                      <span className="text-[var(--text-muted)] font-normal text-[10px]">
                        ({activeTotal > 0 ? Math.round((cat.value / activeTotal) * 100) : 0}%)
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyChart message={timeframe === "month" ? "No expenses this month" : "No expenses this year"} />
          )}
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          variants={item}
          className="lg:col-span-1 border border-zinc-900 bg-zinc-950/60 rounded-2xl p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs uppercase tracking-wider font-bold text-zinc-400">
              Recent Transactions
            </h3>
            <Link
              href="/expenses"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1.5"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {data.recentExpenses.length > 0 ? (
            <div className="space-y-3.5 flex-grow">
              {data.recentExpenses.slice(0, 5).map((expense) => {
                const config = CATEGORY_CONFIG[expense.category];
                return (
                  <Link
                    href={`/expenses/${expense.id}/edit`}
                    key={expense.id}
                    className="flex items-center justify-between py-1.5 border-b border-zinc-900/60 last:border-0 hover:bg-zinc-900/10 rounded-xl px-1.5 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-sm border transition-transform group-hover:scale-105"
                        style={{
                          background: `${config?.color}08`,
                          borderColor: `${config?.color}15`,
                        }}
                      >
                        {config?.icon || "📌"}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {expense.item}
                        </p>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase">
                          {config?.label}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-white">
                        {formatCurrency(expense.amount)}
                      </p>
                      <p className="text-[9px] text-zinc-500 font-semibold uppercase">
                        {formatDateShort(expense.date)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyChart message="No transactions yet" />
          )}

          {data.recentExpenses.length > 0 && (
            <Link
              href="/expenses"
              className="flex items-center justify-center gap-1 mt-5 text-[11px] font-bold text-zinc-400 hover:text-emerald-400 transition-colors border-t border-zinc-900 pt-3"
            >
              <span>View all transactions</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </motion.div>
      </div>

      {/* ===== SECOND ROW ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Mode Distribution */}
        <motion.div
          variants={item}
          className="lg:col-span-1 border border-zinc-900 bg-zinc-950/60 rounded-2xl p-5 flex flex-col justify-between"
        >
          <h3 className="text-xs uppercase tracking-wider font-bold text-zinc-400 mb-4">
            Payment Mode Distribution
          </h3>
          {paymentData.length > 0 ? (
            <div className="flex flex-col flex-grow justify-between">
              <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {paymentData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) =>
                        active && payload?.[0] ? (
                          <div className="rounded-xl border border-zinc-800 bg-zinc-950/95 px-3 py-2 shadow-2xl backdrop-blur-md text-xs">
                            <p className="text-[var(--text-muted)] font-medium">
                              {payload[0].name}
                            </p>
                            <p className="text-white font-bold text-sm">
                              {formatCurrency(payload[0].value as number)}
                            </p>
                          </div>
                        ) : null
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Total</p>
                  <p className="text-base font-black text-white tracking-tight">
                    {formatCompactCurrency(activeTotal)}
                  </p>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-2 mt-4 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
                {paymentData.map((pm) => (
                  <div key={pm.name} className="flex items-center justify-between text-xs py-0.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: pm.color }} />
                      <span className="text-[var(--text-secondary)] font-medium">{pm.name}</span>
                    </div>
                    <span className="text-white font-semibold">
                      {formatCurrency(pm.value)}{" "}
                      <span className="text-[var(--text-muted)] font-normal text-[10px]">
                        ({activeTotal > 0 ? Math.round((pm.value / activeTotal) * 100) : 0}%)
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyChart message="No payment data" />
          )}
        </motion.div>

        {/* AI Insights Preview */}
        <motion.div
          variants={item}
          className="lg:col-span-1 border border-zinc-900 bg-zinc-950/60 rounded-2xl p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs uppercase tracking-wider font-bold text-zinc-400 flex items-center gap-2">
              <span>✨</span> AI Insights Preview
            </h3>
          </div>

          <div className="space-y-3 flex-grow">
            {data.monthChange !== 0 && (
              <InsightRow
                icon="📊"
                text={`You spent ${Math.abs(data.monthChange)}% ${
                  data.monthChange > 0 ? "more" : "less"
                } than last month.`}
                type={data.monthChange > 0 ? "negative" : "positive"}
              />
            )}
            {data.topCategory && (
              <InsightRow
                icon="🔥"
                text={`${
                  CATEGORY_CONFIG[data.topCategory.category]?.label
                } is your top spending category at ${formatCurrency(
                  data.topCategory.amount,
                )}.`}
                type="neutral"
              />
            )}
            {data.dailyAverage > 0 && (
              <InsightRow
                icon="💡"
                text={`Your average daily spending is ${formatCurrency(data.dailyAverage)}.`}
                type="neutral"
              />
            )}
            {data.topPaymentMode && (
              <InsightRow
                icon="💳"
                text={`You used ${
                  PAYMENT_MODE_CONFIG[data.topPaymentMode.mode]?.label
                } ${
                  data.totalMonthSpent > 0
                    ? Math.round((data.topPaymentMode.amount / data.totalMonthSpent) * 100)
                    : 0
                }% of the time.`}
                type="neutral"
              />
            )}
            {data.goals.length > 0 && (
              <InsightRow
                icon="🎯"
                text={`${data.goals[0].name} progress is ${data.goals[0].progress}%.`}
                type="positive"
              />
            )}
            {!hasData && (
              <p className="text-xs text-[var(--text-muted)] text-center py-8">
                Add expenses to get AI insights
              </p>
            )}
          </div>

          <Link
            href="/insights"
            className="flex items-center justify-center gap-1.5 mt-5 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors border-t border-zinc-900 pt-3"
          >
            <span>View all insights</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={item} className="lg:col-span-1 space-y-4">
          {/* Net Worth Card */}
          <motion.div
            whileHover={{ y: -3, borderColor: "rgba(245, 158, 11, 0.25)" }}
            className="border border-zinc-900 bg-zinc-950/60 rounded-2xl p-5 relative overflow-hidden group metric-accent-amber"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/[0.02] rounded-full blur-xl pointer-events-none" />
            <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mb-2">
              Net Worth
            </p>
            <p className="text-2xl font-black text-white tracking-tight">
              {formatCompactCurrency(data.netWorth)}
            </p>
            {data.netWorthChange !== 0 && (
              <div className="flex items-center gap-1 mt-2">
                {data.netWorthChange > 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                )}
                <span
                  className={`text-[10px] font-bold ${
                    data.netWorthChange > 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {data.netWorthChange > 0 ? "+" : ""}
                  {formatCompactCurrency(data.netWorthChange)} MoM
                </span>
              </div>
            )}
          </motion.div>

          {/* Month Investment */}
          <motion.div
            whileHover={{ y: -3, borderColor: "rgba(139, 92, 246, 0.25)" }}
            className="border border-zinc-900 bg-zinc-950/60 rounded-2xl p-5 relative overflow-hidden group metric-accent-purple"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/[0.02] rounded-full blur-xl pointer-events-none" />
            <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mb-2">
              This Month Invested
            </p>
            <p className="text-2xl font-black text-white tracking-tight">
              {formatCompactCurrency(data.totalYearInvestment)}
            </p>
            <Link
              href="/budget"
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1.5 mt-3 inline-flex"
            >
              <span>View details</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </motion.div>

          {/* Goal Progress (first goal) */}
          {data.goals.length > 0 && (
            <motion.div
              whileHover={{ y: -3 }}
              className="border border-zinc-900 bg-zinc-950/60 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{data.goals[0].name}</span>
                </p>
                <span className="text-xs text-emerald-400 font-bold">
                  {data.goals[0].progress}%
                </span>
              </div>
              <div className="progress-bar mb-3 bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                <div
                  className="progress-fill h-full bg-gradient-to-r from-emerald-400 to-teal-500"
                  style={{ width: `${Math.min(data.goals[0].progress, 100)}%` }}
                />
              </div>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                {formatCompactCurrency(data.goals[0].currentAmount)} /{" "}
                {formatCompactCurrency(data.goals[0].targetAmount)}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

function InsightRow({
  icon,
  text,
  type,
}: {
  icon: string;
  text: string;
  type: "positive" | "negative" | "neutral";
}) {
  const isPositive = type === "positive";
  const isNegative = type === "negative";

  let typeLabel = "Insight";
  let typeColor = "border-l-blue-500 bg-blue-500/5 text-blue-400";
  if (isPositive) {
    typeLabel = "Milestone";
    typeColor = "border-l-emerald-500 bg-emerald-500/5 text-emerald-400";
  } else if (isNegative) {
    typeLabel = "Action Required";
    typeColor = "border-l-rose-500 bg-rose-500/5 text-rose-400";
  }

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl border border-zinc-900/60 border-l-4 ${typeColor} transition-all hover:bg-zinc-900/40`}
    >
      <span className="text-sm mt-0.5 shrink-0">{icon}</span>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[var(--text-secondary)]">
            {typeLabel}
          </span>
          <Link
            href="/insights"
            className="text-[10px] font-semibold text-zinc-400 hover:text-emerald-400 transition-colors"
          >
            Details →
          </Link>
        </div>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          {text}
        </p>
      </div>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[200px] text-center">
      <div className="w-11 h-11 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
        <Wallet className="w-4 h-4 text-[var(--text-muted)]" />
      </div>
      <p className="text-xs text-[var(--text-muted)] font-medium">{message}</p>
    </div>
  );
}
