"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, TrendingUp, ArrowLeft } from "lucide-react";
import {
  formatCurrency,
  formatCompactCurrency,
  getMonthName,
} from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Link from "next/link";

interface Investment {
  id: string;
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
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

const INVESTMENT_TYPES = [
  { key: "mutualFundInvestment", label: "Mutual Funds", color: "#10b981" },
  { key: "stockInvestment", label: "Stocks", color: "#3b82f6" },
  { key: "fdInvestment", label: "FD", color: "#f59e0b" },
  { key: "npsContribution", label: "NPS", color: "#8b5cf6" },
  { key: "epfContribution", label: "EPF", color: "#06b6d4" },
  { key: "goldInvestment", label: "Gold", color: "#eab308" },
  { key: "arbitrageInvestment", label: "Arbitrage", color: "#ec4899" },
  { key: "liquidFundInvestment", label: "Liquid Fund", color: "#14b8a6" },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey?: string | number;
    color?: string;
    name: string;
    value: number;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card-elevated px-3 py-2 !rounded-lg text-xs space-y-1">
      <p className="text-[var(--text-muted)] font-medium">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-[var(--text-secondary)]">{p.name}</span>
          <span className="text-white font-medium ml-auto">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function InvestmentClient({
  initialData,
  year,
}: {
  initialData: Investment[];
  year: number;
}) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [investments, setInvestments] = useState(initialData);

  const totalInvested = investments.reduce((sum: number, inv) => {
    return (
      sum +
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

  // Breakdown by type
  const typeBreakdown = INVESTMENT_TYPES.map((t) => ({
    ...t,
    total: investments.reduce(
      (s: number, inv) => s + (Number(inv[t.key as keyof Investment]) || 0),
      0
    ),
  })).filter((t) => t.total > 0);

  // Chart data
  const chartData = investments.map((inv) => ({
    month: getMonthName(inv.month),
    ...INVESTMENT_TYPES.reduce(
      (acc, t) => ({ ...acc, [t.label]: Number(inv[t.key as keyof Investment]) || 0 }),
      {}
    ),
  }));

  // Form state
  const [form, setForm] = useState({
    month: new Date().getMonth() + 1,
    year,
    mutualFundInvestment: 0,
    stockInvestment: 0,
    fdInvestment: 0,
    arbitrageInvestment: 0,
    liquidFundInvestment: 0,
    npsContribution: 0,
    epfContribution: 0,
    goldInvestment: 0,
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        window.location.reload();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Investments</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Track your monthly investment contributions
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Entry</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="glass-card-static p-6 space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[var(--text-muted)] mb-1 block">Month</label>
              <select
                value={form.month}
                onChange={(e) => setForm({ ...form, month: Number(e.target.value) })}
                className="form-input"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {getMonthName(i + 1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] mb-1 block">Year</label>
              <input
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                className="form-input"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {INVESTMENT_TYPES.map((t) => (
              <div key={t.key}>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">
                  {t.label}
                </label>
                <input
                  type="number"
                  value={form[t.key as keyof typeof form] as number}
                  onChange={(e) =>
                    setForm({ ...form, [t.key]: Number(e.target.value) })
                  }
                  className="form-input"
                  min="0"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? "Saving..." : "Save Entry"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </motion.form>
      )}

      {/* Total Card */}
      <div className="glass-card-static p-6 metric-accent-purple">
        <p className="text-xs text-[var(--text-muted)] font-medium mb-1">
          Total Invested in {year}
        </p>
        <p className="text-3xl font-bold text-white">
          {formatCurrency(totalInvested)}
        </p>
      </div>

      {/* Breakdown Cards */}
      {typeBreakdown.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {typeBreakdown.map((t) => (
            <div key={t.key} className="glass-card-static p-4">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: t.color }}
                />
                <span className="text-xs text-[var(--text-muted)]">
                  {t.label}
                </span>
              </div>
              <p className="text-lg font-bold text-white">
                {formatCurrency(t.total)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="glass-card-static p-5">
          <h3 className="text-sm font-semibold text-white mb-4">
            Monthly Investment Trend
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
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
                {INVESTMENT_TYPES.map((t) => (
                  <Bar
                    key={t.key}
                    dataKey={t.label}
                    stackId="a"
                    fill={t.color}
                    radius={[0, 0, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Empty State */}
      {investments.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center mb-4">
            <TrendingUp className="w-7 h-7 text-[var(--text-muted)]" />
          </div>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            No investment entries yet
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Add your first entry
          </button>
        </div>
      )}
    </div>
  );
}
