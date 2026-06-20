"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  formatCurrency,
  getMonthName,
  CATEGORY_CONFIG,
  PAYMENT_MODE_CONFIG,
  VEHICLE_TYPE_CONFIG,
} from "@/lib/utils";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
} from "recharts";

interface Props {
  expenses: any[];
  investments: any[];
  netWorthSnapshots: any[];
  vehicleExpenses: any[];
  year: number;
  availableYears: number[];
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card-elevated px-3 py-2 !rounded-lg text-xs">
      <p className="text-[var(--text-muted)]">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-white font-semibold">{p.name}: {formatCurrency(p.value)}</p>
      ))}
    </div>
  );
}

export default function AnalyticsClient({ expenses, investments, netWorthSnapshots, vehicleExpenses, year, availableYears }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleYearChange = (newYear: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", newYear);
    router.push(`?${params.toString()}`);
  };

  // Monthly expense trend
  const monthlyExpenses = useMemo(() => {
    const months: Record<number, number> = {};
    expenses.forEach((e) => { const m = new Date(e.date).getMonth() + 1; months[m] = (months[m] || 0) + e.amount; });
    return Array.from({ length: 12 }, (_, i) => ({ month: getMonthName(i + 1), amount: months[i + 1] || 0 }));
  }, [expenses]);

  // Monthly investment trend
  const monthlyInvestments = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const inv = investments.find((x: any) => x.month === i + 1);
      const total = inv ? inv.mutualFundInvestment + inv.stockInvestment + inv.fdInvestment + inv.arbitrageInvestment + inv.liquidFundInvestment + inv.npsContribution + inv.epfContribution + inv.goldInvestment : 0;
      return { month: getMonthName(i + 1), amount: total };
    });
  }, [investments]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    expenses.forEach((e: any) => { cats[e.category] = (cats[e.category] || 0) + e.amount; });
    return Object.entries(cats).map(([k, v]) => ({ name: CATEGORY_CONFIG[k]?.label || k, value: v, color: CATEGORY_CONFIG[k]?.color || "#6b7280" })).sort((a, b) => b.value - a.value);
  }, [expenses]);

  // Payment mode breakdown
  const paymentData = useMemo(() => {
    const pms: Record<string, number> = {};
    expenses.forEach((e: any) => { pms[e.paymentMode] = (pms[e.paymentMode] || 0) + e.amount; });
    return Object.entries(pms).map(([k, v]) => ({ name: PAYMENT_MODE_CONFIG[k]?.label || k, value: v, color: PAYMENT_MODE_CONFIG[k]?.color || "#6b7280" })).sort((a, b) => b.value - a.value);
  }, [expenses]);

  // Net worth trend
  const nwTrend = useMemo(() => {
    return netWorthSnapshots.map((s: any) => ({ label: `${getMonthName(s.month)} ${s.year}`, netWorth: s.netWorth }));
  }, [netWorthSnapshots]);

  // Vehicle breakdown
  const vehicleData = useMemo(() => {
    const types: Record<string, number> = {};
    vehicleExpenses.forEach((e: any) => { types[e.type] = (types[e.type] || 0) + e.amount; });
    return Object.entries(types).map(([k, v]) => ({ name: VEHICLE_TYPE_CONFIG[k]?.label || k, value: v, color: VEHICLE_TYPE_CONFIG[k]?.color || "#6b7280" })).sort((a, b) => b.value - a.value);
  }, [vehicleExpenses]);

  // Savings rate
  const savingsRate = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const exp = monthlyExpenses[i].amount;
      const inv = monthlyInvestments[i].amount;
      const total = exp + inv;
      return { month: getMonthName(i + 1), rate: total > 0 ? Math.round((inv / total) * 100) : 0 };
    });
  }, [monthlyExpenses, monthlyInvestments]);

  const hasData = expenses.length > 0;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-[var(--text-muted)]">{year} Overview</p>
        </div>
        
        {/* Year Selector */}
        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 rounded-xl">
          <span className="text-[11px] text-[var(--text-muted)] font-medium">Year:</span>
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

      {hasData ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Expense Trend */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card-static p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Monthly Expense Trend</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyExpenses}>
                  <defs><linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="amount" name="Expenses" stroke="#10b981" strokeWidth={2} fill="url(#expGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Monthly Investment Trend */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card-static p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Monthly Investment Trend</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyInvestments}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="amount" name="Investment" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Category Breakdown */}
          {categoryData.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card-static p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Expense Category Breakdown</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none">
                    {categoryData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie><Tooltip content={({ active, payload }) => active && payload?.[0] ? <div className="glass-card-elevated px-3 py-2 !rounded-lg text-xs"><p className="text-[var(--text-muted)]">{payload[0].name}</p><p className="text-white font-semibold">{formatCurrency(payload[0].value as number)}</p></div> : null} /></PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">{categoryData.slice(0, 6).map((c) => (
                <div key={c.name} className="flex items-center justify-between text-xs"><div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} /><span className="text-[var(--text-secondary)]">{c.name}</span></div><span className="text-white font-medium">{formatCurrency(c.value)}</span></div>
              ))}</div>
            </motion.div>
          )}

          {/* Payment Mode Breakdown */}
          {paymentData.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card-static p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Payment Mode Breakdown</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={paymentData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none">
                    {paymentData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie><Tooltip content={({ active, payload }) => active && payload?.[0] ? <div className="glass-card-elevated px-3 py-2 !rounded-lg text-xs"><p className="text-[var(--text-muted)]">{payload[0].name}</p><p className="text-white font-semibold">{formatCurrency(payload[0].value as number)}</p></div> : null} /></PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">{paymentData.map((p) => (
                <div key={p.name} className="flex items-center justify-between text-xs"><div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} /><span className="text-[var(--text-secondary)]">{p.name}</span></div><span className="text-white font-medium">{formatCurrency(p.value)}</span></div>
              ))}</div>
            </motion.div>
          )}

          {/* Net Worth Growth */}
          {nwTrend.length > 1 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card-static p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Net Worth Growth</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={nwTrend}>
                    <defs><linearGradient id="nwGrad2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} /><stop offset="95%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="netWorth" name="Net Worth" stroke="#f59e0b" strokeWidth={2} fill="url(#nwGrad2)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Vehicle Breakdown */}
          {vehicleData.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card-static p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Vehicle Expense Breakdown</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={vehicleData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none">
                    {vehicleData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie><Tooltip content={({ active, payload }) => active && payload?.[0] ? <div className="glass-card-elevated px-3 py-2 !rounded-lg text-xs"><p className="text-[var(--text-muted)]">{payload[0].name}</p><p className="text-white font-semibold">{formatCurrency(payload[0].value as number)}</p></div> : null} /></PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">{vehicleData.map((v) => (
                <div key={v.name} className="flex items-center justify-between text-xs"><div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ background: v.color }} /><span className="text-[var(--text-secondary)]">{v.name}</span></div><span className="text-white font-medium">{formatCurrency(v.value)}</span></div>
              ))}</div>
            </motion.div>
          )}

          {/* Savings Rate Trend */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card-static p-5 lg:col-span-2">
            <h3 className="text-sm font-semibold text-white mb-4">Savings Rate Trend</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={savingsRate}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip content={({ active, payload, label }) => active && payload?.[0] ? <div className="glass-card-elevated px-3 py-2 !rounded-lg text-xs"><p className="text-[var(--text-muted)]">{label}</p><p className="text-white font-semibold">{payload[0].value}%</p></div> : null} />
                  <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: "#10b981" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-sm text-[var(--text-muted)]">Add expenses and investments to see analytics</p>
        </div>
      )}
    </div>
  );
}
