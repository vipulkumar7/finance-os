"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  CreditCard,
  Tag,
  Calendar,
} from "lucide-react";
import {
  formatCurrency,
  formatCompactCurrency,
  CATEGORY_CONFIG,
  PAYMENT_MODE_CONFIG,
  formatDateShort,
  getMonthName,
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
  Legend,
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
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card-elevated px-3 py-2 !rounded-lg text-xs">
      <p className="text-[var(--text-muted)] mb-1">{label}</p>
      <p className="text-white font-semibold">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export default function DashboardClient({ data }: { data: DashboardData }) {
  const [timeframe, setTimeframe] = useState<"month" | "year">("month");

  const activeBreakdown = timeframe === "month" ? data.categoryBreakdown : data.yearCategoryBreakdown;
  const activePaymentBreakdown = timeframe === "month" ? data.paymentBreakdown : data.yearPaymentBreakdown;
  const activeTotal = timeframe === "month" ? data.totalMonthSpent : data.totalYearSpent;
  const activeDailyAverage = timeframe === "month" ? data.dailyAverage : data.yearDailyAverage;
  const activeTopCategory = timeframe === "month" ? data.topCategory : data.topYearCategory;
  const activeTopPaymentMode = timeframe === "month" ? data.topPaymentMode : data.topYearPaymentMode;

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

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-4 md:p-8 space-y-6"
    >
      {/* Timeframe Toggle Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Dashboard</h2>
          <p className="text-xs text-[var(--text-muted)]">Personal financial insights</p>
        </div>
        <div className="flex items-center bg-zinc-900 border border-zinc-800 p-0.5 rounded-xl">
          <button
            onClick={() => setTimeframe("month")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              timeframe === "month"
                ? "bg-[var(--bg-elevated)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-white"
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setTimeframe("year")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              timeframe === "year"
                ? "bg-[var(--bg-elevated)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-white"
            }`}
          >
            This Year
          </button>
        </div>
      </motion.div>
      {/* ===== TOP METRIC CARDS ===== */}
      <motion.div
        variants={item}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
      >
        {/* Total Spent */}
        <div className="glass-card-static p-4 md:p-5 metric-accent-green">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-xs text-[var(--text-muted)] font-medium">
              Total Spent {timeframe === "month" ? "This Month" : "This Year"}
            </span>
          </div>
          <p className="text-xl md:text-2xl font-bold text-white">
            {formatCurrency(activeTotal)}
          </p>
          {timeframe === "month" && data.monthChange !== 0 && (
            <div className="flex items-center gap-1 mt-1">
              {data.monthChange > 0 ? (
                <TrendingUp className="w-3 h-3 text-red-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-emerald-400" />
              )}
              <span
                className={`text-xs font-medium ${
                  data.monthChange > 0 ? "text-red-400" : "text-emerald-400"
                }`}
              >
                {data.monthChange > 0 ? "+" : ""}
                {data.monthChange}% vs last month
              </span>
            </div>
          )}
        </div>

        {/* Daily Average */}
        <div className="glass-card-static p-4 md:p-5 metric-accent-blue">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-xs text-[var(--text-muted)] font-medium">
              Daily Average {timeframe === "month" ? "This Month" : "This Year"}
            </span>
          </div>
          <p className="text-xl md:text-2xl font-bold text-white">
            {formatCurrency(activeDailyAverage)}
          </p>
          {timeframe === "month" && (
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Today: {formatCurrency(data.totalTodaySpent)}
            </p>
          )}
        </div>

        {/* Top Category */}
        <div className="glass-card-static p-4 md:p-5 metric-accent-purple">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 flex items-center justify-center">
              <Tag className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-xs text-[var(--text-muted)] font-medium">
              Top Category
            </span>
          </div>
          <p className="text-lg md:text-xl font-bold text-white">
            {activeTopCategory
              ? CATEGORY_CONFIG[activeTopCategory.category]?.label || "—"
              : "—"}
          </p>
          {activeTopCategory && (
            <p className="text-xs text-emerald-400 mt-1">
              {formatCurrency(activeTopCategory.amount)}{" "}
              <span className="text-[var(--text-muted)]">
                ·{" "}
                {activeTotal > 0
                  ? Math.round(
                      (activeTopCategory.amount / activeTotal) * 100
                    )
                  : 0}
                % of total
              </span>
            </p>
          )}
        </div>

        {/* Top Payment Mode */}
        <div className="glass-card-static p-4 md:p-5 metric-accent-amber">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-xs text-[var(--text-muted)] font-medium">
              Top Payment Mode
            </span>
          </div>
          <p className="text-lg md:text-xl font-bold text-white truncate">
            {activeTopPaymentMode
              ? PAYMENT_MODE_CONFIG[activeTopPaymentMode.mode]?.label || "—"
              : "—"}
          </p>
          {activeTopPaymentMode && (
            <p className="text-xs text-amber-400 mt-1">
              {formatCurrency(activeTopPaymentMode.amount)}{" "}
              <span className="text-[var(--text-muted)]">
                ·{" "}
                {activeTotal > 0
                  ? Math.round(
                      (activeTopPaymentMode.amount / activeTotal) * 100
                    )
                  : 0}
                % of total
              </span>
            </p>
          )}
        </div>
      </motion.div>

      {/* ===== CHARTS ROW ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Monthly Spending Trend */}
        <motion.div variants={item} className="lg:col-span-1 glass-card-static p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">
              Monthly Spending Trend
            </h3>
            <span className="text-xs text-[var(--text-muted)]">This Year</span>
          </div>

          {hasData ? (
            <>
              <p className="text-2xl font-bold text-white mb-1">
                {formatCurrency(
                  data.monthlyTrend.reduce((s, m) => s + m.amount, 0)
                )}
              </p>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                Total till date
              </p>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.monthlyTrend}>
                    <defs>
                      <linearGradient
                        id="colorAmount"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.04)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280", fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280", fontSize: 11 }}
                      tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#colorAmount)"
                      dot={false}
                      activeDot={{
                        r: 5,
                        fill: "#10b981",
                        stroke: "#0a0a0f",
                        strokeWidth: 2,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <EmptyChart message="Add expenses to see spending trends" />
          )}
        </motion.div>

        {/* Category Breakdown */}
        <motion.div variants={item} className="lg:col-span-1 glass-card-static p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">
              Category Breakdown
            </h3>
          </div>

          {categoryData.length > 0 ? (
            <div className="flex flex-col items-center">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
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
                           <div className="glass-card-elevated px-3 py-2 !rounded-lg text-xs">
                            <p className="text-[var(--text-muted)]">
                              {payload[0].name}
                            </p>
                            <p className="text-white font-semibold">
                              {formatCurrency(payload[0].value as number)}
                            </p>
                          </div>
                        ) : null
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Center label */}
              <div className="text-center -mt-[130px] mb-[60px]">
                <p className="text-xl font-bold text-white">
                  {formatCurrency(activeTotal)}
                </p>
                <p className="text-xs text-[var(--text-muted)]">Total</p>
              </div>
              {/* Legend */}
              <div className="w-full space-y-2 mt-2">
                {categoryData.slice(0, 5).map((cat) => (
                  <div
                    key={cat.name}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: cat.color }}
                      />
                      <span className="text-[var(--text-secondary)]">
                        {cat.name}
                      </span>
                    </div>
                    <span className="text-white font-medium">
                      {formatCurrency(cat.value)}{" "}
                      <span className="text-[var(--text-muted)]">
                        (
                        {activeTotal > 0
                          ? Math.round((cat.value / activeTotal) * 100)
                          : 0}
                        %)
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
        <motion.div variants={item} className="lg:col-span-1 glass-card-static p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">
              Recent Transactions
            </h3>
            <Link
              href="/expenses"
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {data.recentExpenses.length > 0 ? (
            <div className="space-y-3">
              {data.recentExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between py-2 border-b border-[var(--border-primary)] last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
                      style={{
                        background: `${CATEGORY_CONFIG[expense.category]?.color}15`,
                      }}
                    >
                      {CATEGORY_CONFIG[expense.category]?.icon || "📌"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {expense.item}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {CATEGORY_CONFIG[expense.category]?.label}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">
                      {formatCurrency(expense.amount)}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {formatDateShort(expense.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyChart message="No transactions yet" />
          )}

          {data.recentExpenses.length > 0 && (
            <Link
              href="/expenses"
              className="flex items-center justify-center gap-1 mt-4 text-xs text-[var(--text-muted)] hover:text-emerald-400 transition-colors"
            >
              View all transactions <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </motion.div>
      </div>

      {/* ===== SECOND ROW ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Payment Mode Distribution */}
        <motion.div variants={item} className="lg:col-span-1 glass-card-static p-5">
          <h3 className="text-sm font-semibold text-white mb-4">
            Payment Mode Distribution
          </h3>
          {paymentData.length > 0 ? (
            <div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
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
                          <div className="glass-card-elevated px-3 py-2 !rounded-lg text-xs">
                            <p className="text-[var(--text-muted)]">
                              {payload[0].name}
                            </p>
                            <p className="text-white font-semibold">
                              {formatCurrency(payload[0].value as number)}
                            </p>
                          </div>
                        ) : null
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center -mt-[130px] mb-[60px]">
                <p className="text-xl font-bold text-white">
                  {formatCurrency(activeTotal)}
                </p>
                <p className="text-xs text-[var(--text-muted)]">Total</p>
              </div>
              <div className="space-y-2 mt-2">
                {paymentData.map((pm) => (
                  <div
                    key={pm.name}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: pm.color }}
                      />
                      <span className="text-[var(--text-secondary)]">
                        {pm.name}
                      </span>
                    </div>
                    <span className="text-white font-medium">
                      {formatCurrency(pm.value)}{" "}
                      <span className="text-[var(--text-muted)]">
                        (
                        {activeTotal > 0
                          ? Math.round((pm.value / activeTotal) * 100)
                          : 0}
                        %)
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
        <motion.div variants={item} className="lg:col-span-1 glass-card-static p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="text-base">✨</span> AI Insights
            </h3>
          </div>

          <div className="space-y-3">
            {data.monthChange !== 0 && (
              <InsightRow
                icon="📊"
                text={`You spent ${Math.abs(data.monthChange)}% ${
                  data.monthChange > 0 ? "more" : "less"
                } than last month.`}
              />
            )}
            {data.topCategory && (
              <InsightRow
                icon="🔥"
                text={`${
                  CATEGORY_CONFIG[data.topCategory.category]?.label
                } is your top spending category at ${formatCurrency(
                  data.topCategory.amount
                )}.`}
              />
            )}
            {data.dailyAverage > 0 && (
              <InsightRow
                icon="💡"
                text={`Your average daily spending is ${formatCurrency(
                  data.dailyAverage
                )}.`}
              />
            )}
            {data.topPaymentMode && (
              <InsightRow
                icon="💳"
                text={`You used ${
                  PAYMENT_MODE_CONFIG[data.topPaymentMode.mode]?.label
                } ${
                  data.totalMonthSpent > 0
                    ? Math.round(
                        (data.topPaymentMode.amount / data.totalMonthSpent) * 100
                      )
                    : 0
                }% of the time.`}
              />
            )}
            {data.goals.length > 0 && (
              <InsightRow
                icon="🎯"
                text={`${data.goals[0].name} progress is ${data.goals[0].progress}%.`}
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
            className="flex items-center justify-center gap-1 mt-4 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            View all insights <ArrowRight className="w-3 h-3" />
          </Link>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={item} className="lg:col-span-1 space-y-4">
          {/* Net Worth Card */}
          <div className="glass-card-static p-5 metric-accent-amber">
            <p className="text-xs text-[var(--text-muted)] font-medium mb-2">
              Net Worth
            </p>
            <p className="text-2xl font-bold text-white">
              {formatCompactCurrency(data.netWorth)}
            </p>
            {data.netWorthChange !== 0 && (
              <div className="flex items-center gap-1 mt-1">
                {data.netWorthChange > 0 ? (
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-400" />
                )}
                <span
                  className={`text-xs ${
                    data.netWorthChange > 0
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {data.netWorthChange > 0 ? "+" : ""}
                  {formatCompactCurrency(data.netWorthChange)} MoM
                </span>
              </div>
            )}
          </div>

          {/* Year Investment */}
          <div className="glass-card-static p-5 metric-accent-purple">
            <p className="text-xs text-[var(--text-muted)] font-medium mb-2">
              This Year Invested
            </p>
            <p className="text-2xl font-bold text-white">
              {formatCompactCurrency(data.totalYearInvestment)}
            </p>
            <Link
              href="/investments"
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 mt-2"
            >
              View details <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Goal Progress (first goal) */}
          {data.goals.length > 0 && (
            <div className="glass-card-static p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-[var(--text-muted)] font-medium">
                  {data.goals[0].icon} {data.goals[0].name}
                </p>
                <span className="text-xs text-emerald-400 font-medium">
                  {data.goals[0].progress}%
                </span>
              </div>
              <div className="progress-bar mb-2">
                <div
                  className="progress-fill"
                  style={{ width: `${Math.min(data.goals[0].progress, 100)}%` }}
                />
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                {formatCompactCurrency(data.goals[0].currentAmount)} /{" "}
                {formatCompactCurrency(data.goals[0].targetAmount)}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

function InsightRow({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-[var(--border-primary)] last:border-0">
      <span className="text-sm mt-0.5">{icon}</span>
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed flex-1">
        {text}
      </p>
      <Link
        href="/insights"
        className="text-xs text-emerald-400 hover:text-emerald-300 whitespace-nowrap"
      >
        View details →
      </Link>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[200px] text-center">
      <div className="w-12 h-12 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center mb-3">
        <Wallet className="w-5 h-5 text-[var(--text-muted)]" />
      </div>
      <p className="text-xs text-[var(--text-muted)]">{message}</p>
    </div>
  );
}
