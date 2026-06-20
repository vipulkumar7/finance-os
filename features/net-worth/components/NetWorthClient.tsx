"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import {
  formatCurrency,
  formatCompactCurrency,
  getMonthName,
  getPercentageChange,
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
} from "recharts";

interface Snapshot {
  id: string;
  month: number;
  year: number;
  mutualFundsValue: number;
  stocksValue: number;
  epfValue: number;
  npsValue: number;
  fdValue: number;
  liquidFundValue: number;
  arbitrageFundValue: number;
  savingsAccountValue: number;
  goldValue: number;
  personalLoan: number;
  homeLoan: number;
  otherLoan: number;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  createdAt: string;
  updatedAt: string;
}

const ASSET_COLORS: Record<string, { label: string; color: string }> = {
  mutualFundsValue: { label: "Mutual Funds", color: "#10b981" },
  stocksValue: { label: "Stocks", color: "#3b82f6" },
  epfValue: { label: "EPF", color: "#06b6d4" },
  npsValue: { label: "NPS", color: "#8b5cf6" },
  fdValue: { label: "FD", color: "#f59e0b" },
  liquidFundValue: { label: "Liquid Fund", color: "#14b8a6" },
  arbitrageFundValue: { label: "Arbitrage", color: "#ec4899" },
  savingsAccountValue: { label: "Savings", color: "#22c55e" },
  goldValue: { label: "Gold", color: "#eab308" },
};

export default function NetWorthClient({ snapshots }: { snapshots: Snapshot[] }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const latest = snapshots[snapshots.length - 1];
  const previous = snapshots.length > 1 ? snapshots[snapshots.length - 2] : null;

  const momChange = latest && previous
    ? getPercentageChange(latest.netWorth, previous.netWorth)
    : 0;

  // Chart data
  const chartData = snapshots.map((s) => ({
    label: `${getMonthName(s.month)} ${s.year}`,
    netWorth: s.netWorth,
    assets: s.totalAssets,
    liabilities: s.totalLiabilities,
  }));

  // Asset allocation
  const assetAllocation = latest
    ? Object.entries(ASSET_COLORS)
        .map(([key, config]) => ({
          name: config.label,
          value: (latest as any)[key] || 0,
          color: config.color,
        }))
        .filter((a) => a.value > 0)
    : [];

  const [form, setForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    mutualFundsValue: 0, stocksValue: 0, epfValue: 0, npsValue: 0,
    fdValue: 0, liquidFundValue: 0, arbitrageFundValue: 0,
    savingsAccountValue: 0, goldValue: 0,
    personalLoan: 0, homeLoan: 0, otherLoan: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/net-worth", {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Net Worth</h1>
          <p className="text-sm text-[var(--text-muted)]">Monthly snapshots</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Snapshot</span>
        </button>
      </div>

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
              <select value={form.month} onChange={(e) => setForm({ ...form, month: Number(e.target.value) })} className="form-input">
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] mb-1 block">Year</label>
              <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} className="form-input" />
            </div>
          </div>
          <p className="text-xs text-emerald-400 font-medium">Assets</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(ASSET_COLORS).map(([key, config]) => (
              <div key={key}>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">{config.label}</label>
                <input type="number" value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })} className="form-input" min="0" />
              </div>
            ))}
          </div>
          <p className="text-xs text-red-400 font-medium">Liabilities</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { key: "personalLoan", label: "Personal Loan" },
              { key: "homeLoan", label: "Home Loan" },
              { key: "otherLoan", label: "Other Loan" },
            ].map((l) => (
              <div key={l.key}>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">{l.label}</label>
                <input type="number" value={(form as any)[l.key]} onChange={(e) => setForm({ ...form, [l.key]: Number(e.target.value) })} className="form-input" min="0" />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? "Saving..." : "Save Snapshot"}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </motion.form>
      )}

      {/* Net Worth Card */}
      {latest && (
        <div className="glass-card-static p-6 metric-accent-amber">
          <p className="text-xs text-[var(--text-muted)] font-medium mb-1">Current Net Worth</p>
          <p className="text-3xl font-bold text-white">{formatCurrency(latest.netWorth)}</p>
          {momChange !== 0 && (
            <div className="flex items-center gap-1 mt-2">
              {momChange > 0 ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-red-400" />}
              <span className={`text-xs ${momChange > 0 ? "text-emerald-400" : "text-red-400"}`}>{momChange > 0 ? "+" : ""}{momChange}% month-over-month</span>
            </div>
          )}
          <div className="flex gap-6 mt-3">
            <div><p className="text-xs text-[var(--text-muted)]">Assets</p><p className="text-sm font-semibold text-emerald-400">{formatCompactCurrency(latest.totalAssets)}</p></div>
            <div><p className="text-xs text-[var(--text-muted)]">Liabilities</p><p className="text-sm font-semibold text-red-400">{formatCompactCurrency(latest.totalLiabilities)}</p></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Chart */}
        {chartData.length > 1 && (
          <div className="glass-card-static p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Net Worth Growth</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                  <Tooltip content={({ active, payload, label }) => active && payload?.[0] ? (
                    <div className="glass-card-elevated px-3 py-2 !rounded-lg text-xs">
                      <p className="text-[var(--text-muted)]">{label}</p>
                      <p className="text-white font-semibold">{formatCurrency(payload[0].value as number)}</p>
                    </div>
                  ) : null} />
                  <Area type="monotone" dataKey="netWorth" stroke="#f59e0b" strokeWidth={2} fill="url(#nwGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Asset Allocation */}
        {assetAllocation.length > 0 && (
          <div className="glass-card-static p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Asset Allocation</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={assetAllocation} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none">
                    {assetAllocation.map((a, i) => <Cell key={i} fill={a.color} />)}
                  </Pie>
                  <Tooltip content={({ active, payload }) => active && payload?.[0] ? (
                    <div className="glass-card-elevated px-3 py-2 !rounded-lg text-xs">
                      <p className="text-[var(--text-muted)]">{payload[0].name}</p>
                      <p className="text-white font-semibold">{formatCurrency(payload[0].value as number)}</p>
                    </div>
                  ) : null} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {assetAllocation.map((a) => (
                <div key={a.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: a.color }} />
                    <span className="text-[var(--text-secondary)]">{a.name}</span>
                  </div>
                  <span className="text-white font-medium">{formatCompactCurrency(a.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {snapshots.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center mb-4">
            <PiggyBank className="w-7 h-7 text-[var(--text-muted)]" />
          </div>
          <p className="text-sm text-[var(--text-muted)] mb-4">No net worth snapshots yet</p>
          <button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-4 h-4" /> Add first snapshot</button>
        </div>
      )}
    </div>
  );
}
