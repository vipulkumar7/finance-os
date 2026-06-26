"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  formatCurrency,
  formatCompactCurrency,
  getMonthName,
  CATEGORY_CONFIG,
  PAYMENT_MODE_CONFIG,
  VEHICLE_TYPE_CONFIG,
} from "@/lib/utils";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  CreditCard,
  Wallet,
  Percent,
  ArrowUpRight,
  BarChart3,
  LineChart as LucideLineChart,
  Coins,
  Shield,
} from "lucide-react";

interface AnalyticsInvestment {
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

interface AnalyticsNetWorthSnapshot {
  month: number;
  year: number;
  netWorth: number;
}

interface SerializedExpense {
  id: string;
  date: string;
  amount: number;
  category: string;
  paymentMode: string;
  item: string;
  notes: string | null;
}

interface SerializedVehicleExpense {
  id: string;
  date: string;
  amount: number;
  type: string;
  notes: string | null;
}

interface Props {
  expenses: SerializedExpense[];
  investments: AnalyticsInvestment[];
  netWorthSnapshots: AnalyticsNetWorthSnapshot[];
  vehicleExpenses: SerializedVehicleExpense[];
  year: number;
  availableYears: number[];
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  label?: string;
}

function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card-elevated px-3 py-2 !rounded-lg text-xs">
      <p className="text-[var(--text-muted)] font-medium mb-1">{label}</p>
      {payload.map((p, i: number) => (
        <div key={i} className="flex items-center gap-2 mt-0.5">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: p.color || "#10b981" }}
          />
          <span className="text-[var(--text-secondary)]">{p.name}:</span>
          <span className="text-white font-semibold ml-auto">
            {formatCurrency(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsClient({
  expenses,
  investments,
  netWorthSnapshots,
  vehicleExpenses,
  year,
  availableYears,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<
    "overview" | "expenses" | "investments"
  >("expenses");

  const handleYearChange = (newYear: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", newYear);
    router.push(`?${params.toString()}`);
  };

  // Monthly expense trend
  const monthlyExpenses = useMemo(() => {
    const months: Record<number, number> = {};
    expenses.forEach((e) => {
      const m = new Date(e.date).getUTCMonth() + 1;
      months[m] = (months[m] || 0) + e.amount;
    });
    return Array.from({ length: 12 }, (_, i) => ({
      month: getMonthName(i + 1),
      amount: months[i + 1] || 0,
    }));
  }, [expenses]);

  // Monthly investment trend
  const monthlyInvestments = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const inv = investments.find((x) => x.month === i + 1);
      const total = inv
        ? inv.mutualFundInvestment +
          inv.stockInvestment +
          inv.fdInvestment +
          inv.arbitrageInvestment +
          inv.liquidFundInvestment +
          inv.npsContribution +
          inv.epfContribution +
          inv.goldInvestment
        : 0;
      return { month: getMonthName(i + 1), amount: total };
    });
  }, [investments]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    expenses.forEach((e) => {
      cats[e.category] = (cats[e.category] || 0) + e.amount;
    });
    return Object.entries(cats)
      .map(([k, v]) => ({
        name: CATEGORY_CONFIG[k]?.label || k,
        value: v,
        color: CATEGORY_CONFIG[k]?.color || "#6b7280",
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  // Payment mode breakdown
  const paymentData = useMemo(() => {
    const pms: Record<string, number> = {};
    expenses.forEach((e) => {
      pms[e.paymentMode] = (pms[e.paymentMode] || 0) + e.amount;
    });
    return Object.entries(pms)
      .map(([k, v]) => ({
        name: PAYMENT_MODE_CONFIG[k]?.label || k,
        value: v,
        color: PAYMENT_MODE_CONFIG[k]?.color || "#6b7280",
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  // Net worth trend
  const nwTrend = useMemo(() => {
    return netWorthSnapshots.map((s) => ({
      label: `${getMonthName(s.month)} ${s.year}`,
      netWorth: s.netWorth,
    }));
  }, [netWorthSnapshots]);

  // Vehicle breakdown
  const vehicleData = useMemo(() => {
    const types: Record<string, number> = {};
    vehicleExpenses.forEach((e) => {
      types[e.type] = (types[e.type] || 0) + e.amount;
    });
    return Object.entries(types)
      .map(([k, v]) => ({
        name: VEHICLE_TYPE_CONFIG[k]?.label || k,
        value: v,
        color: VEHICLE_TYPE_CONFIG[k]?.color || "#6b7280",
      }))
      .sort((a, b) => b.value - a.value);
  }, [vehicleExpenses]);

  // Savings rate
  const savingsRate = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const exp = monthlyExpenses[i].amount;
      const inv = monthlyInvestments[i].amount;
      const total = exp + inv;
      return {
        month: getMonthName(i + 1),
        rate: total > 0 ? Math.round((inv / total) * 100) : 0,
      };
    });
  }, [monthlyExpenses, monthlyInvestments]);

  // Micro-metrics Calculations
  const metrics = useMemo(() => {
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalInvested = monthlyInvestments.reduce(
      (sum, inv) => sum + inv.amount,
      0,
    );
    const monthsWithExpenses =
      monthlyExpenses.filter((m) => m.amount > 0).length || 1;
    const avgMonthlySpent = totalSpent / monthsWithExpenses;

    // Average Savings Rate (exclude months with 0 savings/spending)
    const validRates = savingsRate.filter((r) => r.rate > 0);
    const avgSavingsRate =
      validRates.length > 0
        ? Math.round(
            validRates.reduce((sum, r) => sum + r.rate, 0) / validRates.length,
          )
        : 0;

    // Net Worth Growth this year
    const nwThisYear = netWorthSnapshots.filter((s) => s.year === year);
    const nwGrowth =
      nwThisYear.length > 1
        ? nwThisYear[nwThisYear.length - 1].netWorth - nwThisYear[0].netWorth
        : 0;

    return {
      totalSpent,
      totalInvested,
      avgMonthlySpent,
      avgSavingsRate,
      nwGrowth,
      topCategory: categoryData[0] || null,
      topPayment: paymentData[0] || null,
    };
  }, [
    expenses,
    monthlyInvestments,
    monthlyExpenses,
    savingsRate,
    netWorthSnapshots,
    year,
    categoryData,
    paymentData,
  ]);

  const hasData =
    expenses.length > 0 ||
    investments.length > 0 ||
    netWorthSnapshots.length > 0;

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-[var(--text-muted)]">
            {year} Financial Report
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Year Selector */}
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 rounded-xl">
            <span className="text-[11px] text-[var(--text-muted)] font-medium">
              Year:
            </span>
            <select
              value={year}
              onChange={(e) => handleYearChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-white outline-none border-none cursor-pointer pr-1"
            >
              {availableYears.map((y) => (
                <option key={y} value={y} className="bg-zinc-950">
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {hasData ? (
        <div className="space-y-6">
          {/* INDmoney Style Navigation Tabs */}
          <div className="flex bg-zinc-900/80 border border-zinc-800/80 p-0.5 rounded-xl max-w-md">
            {[
              { id: "expenses", label: "Expenses", icon: CreditCard },
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "investments", label: "Investments", icon: Wallet },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-zinc-800 text-emerald-400 shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-white"
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab View Container */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <>
                  {/* Overview Stats Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="glass-card-static p-5 metric-accent-green">
                      <p className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                        Avg Savings Rate
                      </p>
                      <h3 className="text-2xl font-extrabold text-white mt-1">
                        {metrics.avgSavingsRate}%
                      </h3>
                      <p className="text-[10px] text-emerald-400 font-medium mt-1">
                        Saved from total inflow
                      </p>
                    </div>
                    <div className="glass-card-static p-5 metric-accent-amber">
                      <p className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                        Net Worth Growth
                      </p>
                      <h3 className="text-2xl font-extrabold text-white mt-1">
                        {metrics.nwGrowth >= 0 ? "+" : ""}
                        {formatCompactCurrency(metrics.nwGrowth)}
                      </h3>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">
                        Snapshot value change
                      </p>
                    </div>
                    <div className="glass-card-static p-5 metric-accent-purple">
                      <p className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                        Total Invested
                      </p>
                      <h3 className="text-2xl font-extrabold text-white mt-1">
                        {formatCompactCurrency(metrics.totalInvested)}
                      </h3>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">
                        Total contributions this year
                      </p>
                    </div>
                  </div>

                  {/* Overview Charts Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Net Worth Area Chart */}
                    {nwTrend.length > 1 && (
                      <div className="glass-card-static p-5">
                        <h3 className="text-sm font-semibold text-white mb-4">
                          Net Worth Growth
                        </h3>
                        <div className="h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={nwTrend}>
                              <defs>
                                <linearGradient
                                  id="nwGradOverview"
                                  x1="0"
                                  y1="0"
                                  x2="0"
                                  y2="1"
                                >
                                  <stop
                                    offset="5%"
                                    stopColor="#f59e0b"
                                    stopOpacity={0.3}
                                  />
                                  <stop
                                    offset="95%"
                                    stopColor="#f59e0b"
                                    stopOpacity={0}
                                  />
                                </linearGradient>
                              </defs>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(255,255,255,0.03)"
                                vertical={false}
                              />
                              <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#6b7280", fontSize: 10 }}
                              />
                              <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#6b7280", fontSize: 10 }}
                                tickFormatter={(v) =>
                                  `₹${(v / 100000).toFixed(0)}L`
                                }
                              />
                              <Tooltip content={<ChartTooltip />} />
                              <Area
                                type="monotone"
                                dataKey="netWorth"
                                name="Net Worth"
                                stroke="#f59e0b"
                                strokeWidth={2.5}
                                fill="url(#nwGradOverview)"
                                dot={false}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* Savings Rate Line Chart */}
                    <div className="glass-card-static p-5">
                      <h3 className="text-sm font-semibold text-white mb-4">
                        Savings Rate Trend
                      </h3>
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={savingsRate}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="rgba(255,255,255,0.03)"
                              vertical={false}
                            />
                            <XAxis
                              dataKey="month"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: "#6b7280", fontSize: 10 }}
                            />
                            <YAxis
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: "#6b7280", fontSize: 10 }}
                              tickFormatter={(v) => `${v}%`}
                            />
                            <Tooltip
                              content={({ active, payload, label }) =>
                                active && payload?.[0] ? (
                                  <div className="glass-card-elevated px-3 py-2 !rounded-lg text-xs">
                                    <p className="text-[var(--text-muted)]">
                                      {label}
                                    </p>
                                    <p className="text-white font-semibold">
                                      Savings Rate: {payload[0].value}%
                                    </p>
                                  </div>
                                ) : null
                              }
                            />
                            <Line
                              type="monotone"
                              dataKey="rate"
                              name="Savings Rate"
                              stroke="#10b981"
                              strokeWidth={2.5}
                              dot={{
                                r: 4,
                                fill: "#10b981",
                                stroke: "#0a0a0f",
                                strokeWidth: 1.5,
                              }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* TAB 2: EXPENSES */}
              {activeTab === "expenses" && (
                <>
                  {/* Expense Stats Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="glass-card-static p-5 metric-accent-green">
                      <p className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                        Total Spent
                      </p>
                      <h3 className="text-2xl font-extrabold text-white mt-1">
                        {formatCurrency(metrics.totalSpent)}
                      </h3>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">
                        Incurred expenses this year
                      </p>
                    </div>
                    <div className="glass-card-static p-5">
                      <p className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                        Monthly Average
                      </p>
                      <h3 className="text-2xl font-extrabold text-white mt-1">
                        {formatCurrency(metrics.avgMonthlySpent)}
                      </h3>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">
                        Across active months
                      </p>
                    </div>
                    <div className="glass-card-static p-5 metric-accent-purple">
                      <p className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                        Top Category
                      </p>
                      <h3 className="text-xl font-bold text-white mt-1.5 truncate">
                        {metrics.topCategory ? metrics.topCategory.name : "—"}
                      </h3>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                        {metrics.topCategory
                          ? `${formatCurrency(metrics.topCategory.value)} spent`
                          : ""}
                      </p>
                    </div>
                  </div>

                  {/* Expense Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Monthly Expense Trend */}
                    <div className="lg:col-span-2 glass-card-static p-5">
                      <h3 className="text-sm font-semibold text-white mb-4">
                        Monthly Expense Trend
                      </h3>
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={monthlyExpenses}>
                            <defs>
                              <linearGradient
                                id="expGradOverview"
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
                              stroke="rgba(255,255,255,0.03)"
                              vertical={false}
                            />
                            <XAxis
                              dataKey="month"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: "#6b7280", fontSize: 10 }}
                            />
                            <YAxis
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: "#6b7280", fontSize: 10 }}
                              tickFormatter={(v) =>
                                `₹${(v / 1000).toFixed(0)}K`
                              }
                            />
                            <Tooltip content={<ChartTooltip />} />
                            <Area
                              type="monotone"
                              dataKey="amount"
                              name="Expenses"
                              stroke="#10b981"
                              strokeWidth={2.5}
                              fill="url(#expGradOverview)"
                              dot={false}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Category Pie Chart */}
                    {categoryData.length > 0 && (
                      <div className="glass-card-static p-5 flex flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-white mb-2">
                            Category Allocation
                          </h3>
                          <div className="h-[180px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={categoryData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={50}
                                  outerRadius={75}
                                  paddingAngle={2}
                                  dataKey="value"
                                  stroke="none"
                                >
                                  {categoryData.map((e, i) => (
                                    <Cell key={i} fill={e.color} />
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
                                          {formatCurrency(
                                            payload[0].value as number,
                                          )}
                                        </p>
                                      </div>
                                    ) : null
                                  }
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                        <div className="space-y-2 mt-4 max-h-[150px] overflow-y-auto pr-1.5 w-full scrollbar-thin scrollbar-thumb-zinc-800">
                          {categoryData.map((c) => (
                            <motion.div
                              key={c.name}
                              whileHover={{ x: 3 }}
                              transition={{ duration: 0.15 }}
                              className="flex items-center justify-between text-[11px] py-1 border-b border-zinc-900/30 last:border-0"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_6px_rgba(255,255,255,0.05)]"
                                  style={{ background: c.color }}
                                />
                                <span className="text-[var(--text-secondary)] font-medium">
                                  {c.name}
                                </span>
                              </div>
                              <span className="text-white font-semibold shrink-0">
                                {formatCurrency(c.value)}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Payment Mode Distribution */}
                    {paymentData.length > 0 && (
                      <div className="lg:col-span-3 glass-card-static p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.01] rounded-full blur-3xl pointer-events-none" />
                        <h3 className="text-sm font-semibold text-white mb-4 relative z-10">
                          Payment Mode Breakdown
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center relative z-10">
                          <div className="md:col-span-1 h-[180px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={paymentData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={50}
                                  outerRadius={75}
                                  paddingAngle={2}
                                  dataKey="value"
                                  stroke="none"
                                >
                                  {paymentData.map((e, i) => (
                                    <Cell key={i} fill={e.color} />
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
                                          {formatCurrency(
                                            payload[0].value as number,
                                          )}
                                        </p>
                                      </div>
                                    ) : null
                                  }
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="md:col-span-2 grid grid-cols-2 gap-3.5">
                            {paymentData.map((p) => (
                              <motion.div
                                key={p.name}
                                whileHover={{
                                  y: -2,
                                  scale: 1.01,
                                  borderColor: "rgba(16,185,129,0.2)",
                                }}
                                transition={{
                                  type: "spring",
                                  stiffness: 350,
                                  damping: 25,
                                }}
                                className="flex flex-col p-3 bg-zinc-950/60 border border-zinc-900 rounded-2xl shadow-inner cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_6px_rgba(255,255,255,0.05)]"
                                    style={{ background: p.color }}
                                  />
                                  <span className="text-[11px] text-[var(--text-muted)] font-semibold truncate">
                                    {p.name}
                                  </span>
                                </div>
                                <span className="text-sm font-bold text-white mt-1.5 tracking-tight">
                                  {formatCurrency(p.value)}
                                </span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* TAB 3: INVESTMENTS */}
              {activeTab === "investments" && (
                <>
                  {/* Investments Stats Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="glass-card-static p-5 metric-accent-purple">
                      <p className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                        Total Invested
                      </p>
                      <h3 className="text-2xl font-extrabold text-white mt-1">
                        {formatCurrency(metrics.totalInvested)}
                      </h3>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">
                        Growth contributions
                      </p>
                    </div>
                    <div className="glass-card-static p-5">
                      <p className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                        Monthly Contribution
                      </p>
                      <h3 className="text-2xl font-extrabold text-white mt-1">
                        {formatCurrency(metrics.totalInvested / 12)}
                      </h3>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">
                        Average contribution monthly
                      </p>
                    </div>
                    <div className="glass-card-static p-5 metric-accent-amber">
                      <p className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                        Vehicle Spending
                      </p>
                      <h3 className="text-2xl font-bold text-white mt-1.5 truncate">
                        {formatCurrency(
                          vehicleExpenses.reduce((sum, e) => sum + e.amount, 0),
                        )}
                      </h3>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                        Asset maintenance & fuel
                      </p>
                    </div>
                  </div>

                  {/* Investments Charts Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Monthly Investment Bar Chart */}
                    <div className="glass-card-static p-5">
                      <h3 className="text-sm font-semibold text-white mb-4">
                        Monthly Investment Trend
                      </h3>
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={monthlyInvestments}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="rgba(255,255,255,0.03)"
                              vertical={false}
                            />
                            <XAxis
                              dataKey="month"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: "#6b7280", fontSize: 10 }}
                            />
                            <YAxis
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: "#6b7280", fontSize: 10 }}
                              tickFormatter={(v) =>
                                `₹${(v / 1000).toFixed(0)}K`
                              }
                            />
                            <Tooltip content={<ChartTooltip />} />
                            <Bar
                              dataKey="amount"
                              name="Investment"
                              fill="#8b5cf6"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Vehicle Breakdown Pie */}
                    {vehicleData.length > 0 ? (
                      <div className="glass-card-static p-5">
                        <h3 className="text-sm font-semibold text-white mb-4">
                          Vehicle Expenses Breakdown
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                          <div className="h-[180px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={vehicleData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={50}
                                  outerRadius={75}
                                  paddingAngle={2}
                                  dataKey="value"
                                  stroke="none"
                                >
                                  {vehicleData.map((e, i) => (
                                    <Cell key={i} fill={e.color} />
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
                                          {formatCurrency(
                                            payload[0].value as number,
                                          )}
                                        </p>
                                      </div>
                                    ) : null
                                  }
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="space-y-1.5">
                            {vehicleData.map((v) => (
                              <div
                                key={v.name}
                                className="flex items-center justify-between text-xs"
                              >
                                <div className="flex items-center gap-1.5">
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ background: v.color }}
                                  />
                                  <span className="text-[var(--text-secondary)]">
                                    {v.name}
                                  </span>
                                </div>
                                <span className="text-white font-semibold">
                                  {formatCurrency(v.value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="glass-card-static p-5 flex items-center justify-center text-center">
                        <p className="text-xs text-[var(--text-muted)]">
                          No vehicle expenses logged for {year}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center">
            <BarChart3 className="w-7 h-7 text-[var(--text-muted)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              No analytics data yet
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Start adding expenses, investments, or snapshots to see reports.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
