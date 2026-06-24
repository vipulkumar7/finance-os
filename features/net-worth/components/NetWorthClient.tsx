"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, TrendingUp, TrendingDown, PiggyBank, Edit2, Trash2, LineChart, Coins, Wallet, Landmark, Shield, Gem } from "lucide-react";
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
  cryptoValue: number;
  lentAmount: number;
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
  savingsAccountValue: { label: "Bank Account", color: "#22c55e" },
  goldValue: { label: "Gold", color: "#eab308" },
  cryptoValue: { label: "Crypto", color: "#f43f5e" },
  lentAmount: { label: "Lent to Others", color: "#a855f7" },
};

export default function NetWorthClient({ snapshots }: { snapshots: Snapshot[] }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const latest = snapshots[snapshots.length - 1];
  const previous = snapshots.length > 1 ? snapshots[snapshots.length - 2] : null;

  const momChange = latest && previous
    ? getPercentageChange(latest.netWorth, previous.netWorth)
    : 0;

  const momAbsoluteChange = latest && previous
    ? latest.netWorth - previous.netWorth
    : 0;

  // Chart data
  const chartData = snapshots.map((s) => ({
    label: `${getMonthName(s.month)} ${s.year}`,
    netWorth: s.netWorth,
    assets: s.totalAssets,
    liabilities: s.totalLiabilities,
  }));

  // INDmoney Category Math
  const equitiesValue = (latest?.stocksValue || 0) + (latest?.mutualFundsValue || 0) + (latest?.arbitrageFundValue || 0) + (latest?.liquidFundValue || 0);
  const bankValue = latest?.savingsAccountValue || 0;
  const retirementValue = (latest?.epfValue || 0) + (latest?.npsValue || 0);
  const fixedIncomeValue = latest?.fdValue || 0;
  const alternateValue = (latest?.cryptoValue || 0) + (latest?.goldValue || 0) + (latest?.lentAmount || 0);

  const totalAssets = latest?.totalAssets || 0;
  const liabilitiesValue = latest?.totalLiabilities || 0;

  const getAssetPercent = (val: number) => totalAssets > 0 ? ((val / totalAssets) * 100).toFixed(1) : "0";
  const getDebtPercent = (val: number) => liabilitiesValue > 0 ? ((val / liabilitiesValue) * 100).toFixed(1) : "0";

  const assetRatio = totalAssets + liabilitiesValue > 0
    ? (totalAssets / (totalAssets + liabilitiesValue)) * 100
    : 100;
  const liabilityRatio = 100 - assetRatio;

  const assetCategories = [
    {
      id: "equities",
      label: "Equities & Mutual Funds",
      value: equitiesValue,
      color: "#10b981",
      bgGradient: "from-emerald-500/10 to-teal-500/5",
      icon: LineChart,
      percent: getAssetPercent(equitiesValue),
      details: [
        { label: "Mutual Funds", val: latest?.mutualFundsValue || 0 },
        { label: "Stocks", val: latest?.stocksValue || 0 },
        { label: "Arbitrage Funds", val: latest?.arbitrageFundValue || 0 },
        { label: "Liquid Funds", val: latest?.liquidFundValue || 0 },
      ].filter(d => d.val > 0)
    },
    {
      id: "bank",
      label: "Bank & Cash",
      value: bankValue,
      color: "#3b82f6",
      bgGradient: "from-blue-500/10 to-indigo-500/5",
      icon: Wallet,
      percent: getAssetPercent(bankValue),
      details: []
    },
    {
      id: "retirement",
      label: "Retirement & EPF",
      value: retirementValue,
      color: "#06b6d4",
      bgGradient: "from-cyan-500/10 to-sky-500/5",
      icon: Shield,
      percent: getAssetPercent(retirementValue),
      details: [
        { label: "EPF", val: latest?.epfValue || 0 },
        { label: "NPS", val: latest?.npsValue || 0 },
      ].filter(d => d.val > 0)
    },
    {
      id: "fixed",
      label: "Fixed Income",
      value: fixedIncomeValue,
      color: "#f59e0b",
      bgGradient: "from-amber-500/10 to-orange-500/5",
      icon: Landmark,
      percent: getAssetPercent(fixedIncomeValue),
      details: []
    },
    {
      id: "alternate",
      label: "Alternate Assets",
      value: alternateValue,
      color: "#a855f7",
      bgGradient: "from-purple-500/10 to-pink-500/5",
      icon: Coins,
      percent: getAssetPercent(alternateValue),
      details: [
        { label: "Crypto", val: latest?.cryptoValue || 0 },
        { label: "Gold", val: latest?.goldValue || 0 },
        { label: "Lent to Others", val: latest?.lentAmount || 0 },
      ].filter(d => d.val > 0)
    }
  ].filter(c => c.value > 0);

  const debtItems = [
    { label: "Personal Loan", val: latest?.personalLoan || 0, percent: getDebtPercent(latest?.personalLoan || 0) },
    { label: "Home Loan", val: latest?.homeLoan || 0, percent: getDebtPercent(latest?.homeLoan || 0) },
    { label: "Other Loans", val: latest?.otherLoan || 0, percent: getDebtPercent(latest?.otherLoan || 0) },
  ].filter(d => d.val > 0);

  const [form, setForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    mutualFundsValue: 0, stocksValue: 0, epfValue: 0, npsValue: 0,
    fdValue: 0, liquidFundValue: 0, arbitrageFundValue: 0,
    savingsAccountValue: 0, goldValue: 0, cryptoValue: 0, lentAmount: 0,
    personalLoan: 0, homeLoan: 0, otherLoan: 0,
  });

  const handleEdit = (s: Snapshot) => {
    setEditingId(s.id);
    setForm({
      month: s.month,
      year: s.year,
      mutualFundsValue: s.mutualFundsValue,
      stocksValue: s.stocksValue,
      epfValue: s.epfValue,
      npsValue: s.npsValue,
      fdValue: s.fdValue,
      liquidFundValue: s.liquidFundValue,
      arbitrageFundValue: s.arbitrageFundValue,
      savingsAccountValue: s.savingsAccountValue,
      goldValue: s.goldValue,
      cryptoValue: s.cryptoValue || 0,
      lentAmount: s.lentAmount || 0,
      personalLoan: s.personalLoan,
      homeLoan: s.homeLoan,
      otherLoan: s.otherLoan,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this snapshot?")) return;
    try {
      const res = await fetch(`/api/net-worth/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowForm(false);
    setForm({
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      mutualFundsValue: 0, stocksValue: 0, epfValue: 0, npsValue: 0,
      fdValue: 0, liquidFundValue: 0, arbitrageFundValue: 0,
      savingsAccountValue: 0, goldValue: 0, cryptoValue: 0, lentAmount: 0,
      personalLoan: 0, homeLoan: 0, otherLoan: 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingId ? `/api/net-worth/${editingId}` : "/api/net-worth";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        setEditingId(null);
        window.location.reload();
      }
    } finally {
      setLoading(false);
    }
  };

  // Sort snapshots newest first for history list
  const historySnapshots = [...snapshots].reverse();

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Net Worth</h1>
          <p className="text-sm text-[var(--text-muted)]">Premium portfolio tracking</p>
        </div>
        <div className="flex items-center gap-3">
          {latest && !showForm && (
            <button
              onClick={() => handleEdit(latest)}
              className="btn-primary"
            >
              <Edit2 className="w-4 h-4" />
              <span>Update Current Month ({getMonthName(latest.month)})</span>
            </button>
          )}
          <button
            onClick={() => {
              if (showForm) {
                handleCancel();
              } else {
                if (latest) {
                  setForm((prev) => ({
                    ...prev,
                    mutualFundsValue: latest.mutualFundsValue,
                    stocksValue: latest.stocksValue,
                    epfValue: latest.epfValue,
                    npsValue: latest.npsValue,
                    fdValue: latest.fdValue,
                    liquidFundValue: latest.liquidFundValue,
                    arbitrageFundValue: latest.arbitrageFundValue,
                    savingsAccountValue: latest.savingsAccountValue,
                    goldValue: latest.goldValue,
                    cryptoValue: latest.cryptoValue || 0,
                    lentAmount: latest.lentAmount || 0,
                    personalLoan: latest.personalLoan,
                    homeLoan: latest.homeLoan,
                    otherLoan: latest.otherLoan,
                  }));
                }
                setShowForm(true);
              }
            }}
            className={latest && !showForm ? "btn-secondary" : "btn-primary"}
          >
            {showForm ? null : <Plus className="w-4 h-4" />}
            <span>{showForm ? "Cancel" : "Add New Month"}</span>
          </button>
        </div>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="glass-card-static p-6 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-[var(--border-primary)] pb-3">
            <h3 className="text-sm font-semibold text-white">
              {editingId ? `Edit Snapshot for ${getMonthName(form.month)} ${form.year}` : "New Snapshot"}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[var(--text-muted)] mb-1 block">Month</label>
              <select
                value={form.month}
                onChange={(e) => setForm({ ...form, month: Number(e.target.value) })}
                className="form-input"
                disabled={!!editingId}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
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
                disabled={!!editingId}
              />
            </div>
          </div>
          <p className="text-xs text-emerald-400 font-medium">Assets</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(ASSET_COLORS).map(([key, config]) => (
              <div key={key}>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">{config.label}</label>
                <input
                  type="number"
                  value={(form as any)[key] === 0 ? "" : (form as any)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value === "" ? 0 : Number(e.target.value) })}
                  className="form-input"
                  min="0"
                  placeholder="0"
                />
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
                <input
                  type="number"
                  value={(form as any)[l.key] === 0 ? "" : (form as any)[l.key]}
                  onChange={(e) => setForm({ ...form, [l.key]: e.target.value === "" ? 0 : Number(e.target.value) })}
                  className="form-input"
                  min="0"
                  placeholder="0"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? "Saving..." : "Save Snapshot"}
            </button>
            <button type="button" onClick={handleCancel} className="btn-secondary">Cancel</button>
          </div>
        </motion.form>
      )}

      {/* INDmoney Style Hero Wealth Display */}
      {latest && (
        <div className="glass-card-static p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider">Total Net Worth</p>
              <h2 className="text-4xl font-extrabold text-white mt-1">{formatCurrency(latest.netWorth)}</h2>
              {previous && (
                <div className="flex items-center gap-1.5 mt-2">
                  {momAbsoluteChange >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-sm font-semibold ${momAbsoluteChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {momAbsoluteChange >= 0 ? "+" : ""}{formatCurrency(momAbsoluteChange)} ({momChange >= 0 ? "+" : ""}{momChange}%)
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">this month</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-8 border-l border-zinc-800 pl-0 sm:pl-8">
              <div>
                <p className="text-[11px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">Assets</p>
                <p className="text-lg font-bold text-emerald-400 mt-0.5">{formatCurrency(latest.totalAssets)}</p>
              </div>
              <div>
                <p className="text-[11px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">Liabilities</p>
                <p className="text-lg font-bold text-red-400 mt-0.5">{formatCurrency(latest.totalLiabilities)}</p>
              </div>
            </div>
          </div>

          {/* Asset vs Debt Ratio bar */}
          <div className="space-y-2">
            <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-zinc-800">
              <div style={{ width: `${assetRatio}%` }} className="h-full bg-emerald-500 transition-all duration-500" />
              <div style={{ width: `${liabilityRatio}%` }} className="h-full bg-rose-500 transition-all duration-500" />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
              <span>Assets: <strong className="text-emerald-400">{assetRatio.toFixed(0)}%</strong></span>
              <span>Debt: <strong className="text-rose-400">{liabilityRatio.toFixed(0)}%</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Main Breakdown Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Middle Column: Asset Classes & Debt list */}
        <div className="lg:col-span-2 space-y-6">
          {latest && (
            <div className="glass-card-static p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white tracking-wide">Assets Allocation</h3>
              <div className="divide-y divide-zinc-800/60">
                {assetCategories.map((cat) => {
                  const Icon = cat.icon;
                  const isExpanded = expandedCategory === cat.id;
                  const hasDetails = cat.details.length > 0;

                  return (
                    <div key={cat.id} className="py-3 first:pt-0 last:pb-0">
                      <div
                        onClick={() => hasDetails && setExpandedCategory(isExpanded ? null : cat.id)}
                        className={`flex items-center justify-between cursor-pointer ${hasDetails ? "hover:opacity-90" : "cursor-default"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center`} style={{ color: cat.color }}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{cat.label}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-[var(--text-muted)]">{cat.percent}% allocation</span>
                              {hasDetails && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-zinc-800 text-[var(--text-secondary)] font-medium">
                                  {isExpanded ? "hide details" : "show details"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-white">{formatCurrency(cat.value)}</p>
                      </div>

                      {/* Expandable Asset Details */}
                      <AnimatePresence>
                        {isExpanded && hasDetails && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-zinc-950/40 rounded-xl mt-2 px-3 py-2 space-y-1.5 border border-zinc-900/60"
                          >
                            {cat.details.map((sub, sIdx) => (
                              <div key={sIdx} className="flex justify-between items-center text-[11px] py-0.5">
                                <span className="text-[var(--text-secondary)]">{sub.label}</span>
                                <span className="text-white font-semibold">{formatCurrency(sub.val)}</span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Liabilities Cards */}
          {latest && debtItems.length > 0 && (
            <div className="glass-card-static p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white tracking-wide">Liabilities & Outstanding Loans</h3>
              <div className="divide-y divide-zinc-800/60">
                {debtItems.map((debt, idx) => (
                  <div key={idx} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
                        <Shield className="w-4 h-4 rotate-180" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{debt.label}</p>
                        <p className="text-[10px] text-rose-400 mt-0.5">{debt.percent}% of total debt</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-white">{formatCurrency(debt.val)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Growth chart */}
        <div className="lg:col-span-1 space-y-6">
          {chartData.length > 1 && (
            <div className="glass-card-static p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Net Worth Growth</h3>
              <div className="h-[230px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 10 }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                    <Tooltip content={({ active, payload, label }) => active && payload?.[0] ? (
                      <div className="glass-card-elevated px-3 py-2 !rounded-lg text-xs">
                        <p className="text-[var(--text-muted)]">{label}</p>
                        <p className="text-white font-semibold">{formatCurrency(payload[0].value as number)}</p>
                      </div>
                    ) : null} />
                    <Area type="monotone" dataKey="netWorth" stroke="#10b981" strokeWidth={2} fill="url(#nwGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Snapshot History Table */}
      {snapshots.length > 0 && (
        <div className="glass-card-static p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">Snapshot History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-primary)] text-[var(--text-muted)]">
                  <th className="py-3 px-2 font-medium">Month</th>
                  <th className="py-3 px-2 font-medium text-right">Net Worth</th>
                  <th className="py-3 px-2 font-medium text-right">Assets</th>
                  <th className="py-3 px-2 font-medium text-right">Liabilities</th>
                  <th className="py-3 px-2 font-medium text-right hidden sm:table-cell">Bank Account</th>
                  <th className="py-3 px-2 font-medium text-right hidden sm:table-cell">Crypto</th>
                  <th className="py-3 px-2 font-medium text-right hidden sm:table-cell">Lent Out</th>
                  <th className="py-3 px-2 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-primary)]">
                {historySnapshots.map((s) => (
                  <tr key={s.id} className="hover:bg-[var(--bg-elevated)]/30 transition-colors">
                    <td className="py-3 px-2 text-white font-medium">
                      {getMonthName(s.month)} {s.year}
                    </td>
                    <td className="py-3 px-2 text-right text-amber-400 font-semibold">
                      {formatCompactCurrency(s.netWorth)}
                    </td>
                    <td className="py-3 px-2 text-right text-emerald-400">
                      {formatCompactCurrency(s.totalAssets)}
                    </td>
                    <td className="py-3 px-2 text-right text-red-400">
                      {formatCompactCurrency(s.totalLiabilities)}
                    </td>
                    <td className="py-3 px-2 text-right text-[var(--text-secondary)] hidden sm:table-cell">
                      {formatCompactCurrency(s.savingsAccountValue)}
                    </td>
                    <td className="py-3 px-2 text-right text-[var(--text-secondary)] hidden sm:table-cell">
                      {formatCompactCurrency(s.cryptoValue || 0)}
                    </td>
                    <td className="py-3 px-2 text-right text-[var(--text-secondary)] hidden sm:table-cell">
                      {formatCompactCurrency(s.lentAmount || 0)}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleEdit(s)}
                          className="p-1 text-[var(--text-muted)] hover:text-white transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-1 text-[var(--text-muted)] hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
