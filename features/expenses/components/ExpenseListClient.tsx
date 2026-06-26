"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Filter,
  ChevronDown,
  X,
  Calendar,
  DollarSign,
  TrendingUp,
  Award,
  Wallet,
  ArrowUpRight,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";
import {
  formatCurrency,
  formatDate,
  CATEGORY_CONFIG,
  PAYMENT_MODE_CONFIG,
  getMonthName,
} from "@/lib/utils";

interface Expense {
  id: string;
  date: string;
  item: string;
  amount: number;
  category: string;
  paymentMode: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ExpenseListClient({
  initialExpenses,
  selectedYear,
  selectedMonth,
  availableYears,
}: {
  initialExpenses: Expense[];
  selectedYear: number;
  selectedMonth: number;
  availableYears: number[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return initialExpenses.filter((e) => {
      if (search && !e.item.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (categoryFilter && e.category !== categoryFilter) return false;
      if (paymentFilter && e.paymentMode !== paymentFilter) return false;
      return true;
    });
  }, [initialExpenses, search, categoryFilter, paymentFilter]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, Expense[]> = {};
    filtered.forEach((e) => {
      const dateKey = e.date.split("T")[0];
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(e);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const totalFiltered = filtered.reduce((s: number, e) => s + e.amount, 0);

  // Compute premium metrics
  const topCategory = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    filtered.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });
    const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0] : null;
  }, [filtered]);

  const avgDailySpending = useMemo(() => {
    if (filtered.length === 0) return 0;
    const uniqueDays = new Set(filtered.map((e) => e.date.split("T")[0])).size;
    return uniqueDays > 0 ? totalFiltered / uniqueDays : 0;
  }, [filtered, totalFiltered]);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Title & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-6 rounded bg-gradient-to-b from-emerald-400 to-teal-500 inline-block" />
            Expenses
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-1">
            Track, filter, and audit your daily outbound transactions
          </p>
        </div>

        {/* Filters and Date Pickers */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Year selector */}
          <div className="relative flex items-center bg-zinc-950/60 border border-zinc-900 px-3.5 py-1.5 rounded-xl transition-colors hover:border-zinc-800">
            <Calendar className="w-3.5 h-3.5 text-zinc-500 mr-2" />
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-white outline-none border-none cursor-pointer pr-4 appearance-none relative z-10"
            >
              {availableYears.map((y) => (
                <option key={y} value={y} className="bg-zinc-950">
                  {y}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-zinc-500 absolute right-3 pointer-events-none" />
          </div>

          {/* Month selector */}
          <div className="relative flex items-center bg-zinc-950/60 border border-zinc-900 px-3.5 py-1.5 rounded-xl transition-colors hover:border-zinc-800">
            <Calendar className="w-3.5 h-3.5 text-zinc-500 mr-2" />
            <select
              value={selectedMonth}
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

          {/* Add Expense Button */}
          <Link
            href="/expenses/add"
            className="bg-emerald-500 hover:bg-emerald-600 text-black py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-950/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </Link>
        </div>
      </div>

      {/* Premium Analytics Metrics Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Spend */}
        <div className="glass-card-static p-5 relative overflow-hidden group metric-accent-green">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/[0.02] rounded-full blur-2xl pointer-events-none" />
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
            Total Monthly Spend
          </p>
          <h3 className="text-2xl font-black text-white mt-1.5 tracking-tight">
            {formatCurrency(totalFiltered)}
          </h3>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-400 font-medium">
            <TrendingDown className="w-3 h-3" />
            <span>{filtered.length} logged payments</span>
          </div>
        </div>

        {/* Top Category */}
        <div className="glass-card-static p-5 relative overflow-hidden group metric-accent-purple">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/[0.02] rounded-full blur-2xl pointer-events-none" />
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
            Top Spending Area
          </p>
          <h3 className="text-2xl font-black text-white mt-1.5 tracking-tight truncate">
            {topCategory
              ? CATEGORY_CONFIG[topCategory[0]]?.label || topCategory[0]
              : "N/A"}
          </h3>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-purple-400 font-medium">
            <Award className="w-3 h-3" />
            <span>
              {topCategory
                ? `${formatCurrency(topCategory[1])} total`
                : "No expenses"}
            </span>
          </div>
        </div>

        {/* Daily Average */}
        <div className="glass-card-static p-5 relative overflow-hidden group metric-accent-amber">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/[0.02] rounded-full blur-2xl pointer-events-none" />
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
            Average Daily Spend
          </p>
          <h3 className="text-2xl font-black text-white mt-1.5 tracking-tight">
            {formatCurrency(avgDailySpending)}
          </h3>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-amber-400 font-medium">
            <Wallet className="w-3 h-3" />
            <span>Average outflow per active day</span>
          </div>
        </div>
      </div>

      {/* Search & Animated Filter System */}
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search expenses by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-950/60 border border-zinc-900 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-800 transition-all focus:bg-zinc-950"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 border rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
              showFilters || categoryFilter || paymentFilter
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : "border-zinc-900 bg-zinc-950/60 text-zinc-400 hover:text-white"
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {(categoryFilter || paymentFilter) && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>
        </div>

        {/* Quick Filter Pill list */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="border border-zinc-900 bg-zinc-950/40 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Advanced Filters
                  </span>
                  {(categoryFilter || paymentFilter) && (
                    <button
                      onClick={() => {
                        setCategoryFilter("");
                        setPaymentFilter("");
                      }}
                      className="text-[10px] font-bold text-rose-400 hover:text-rose-300 uppercase tracking-wider transition-colors"
                    >
                      Reset filters
                    </button>
                  )}
                </div>

                {/* Categories Scroll */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    Filter by Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setCategoryFilter("")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        !categoryFilter
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                          : "border-zinc-900 bg-zinc-950 text-zinc-400 hover:text-white"
                      }`}
                    >
                      All Categories
                    </button>
                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                      const active = categoryFilter === key;
                      return (
                        <button
                          key={key}
                          onClick={() => setCategoryFilter(key)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                            active
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                              : "border-zinc-900 bg-zinc-950 text-zinc-400 hover:text-white"
                          }`}
                        >
                          <span>{config.icon}</span>
                          <span>{config.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-2 pt-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    Filter by Payment Mode
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setPaymentFilter("")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        !paymentFilter
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                          : "border-zinc-900 bg-zinc-950 text-zinc-400 hover:text-white"
                      }`}
                    >
                      All Payment Modes
                    </button>
                    {Object.entries(PAYMENT_MODE_CONFIG).map(
                      ([key, config]) => {
                        const active = paymentFilter === key;
                        return (
                          <button
                            key={key}
                            onClick={() => setPaymentFilter(key)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                              active
                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                : "border-zinc-900 bg-zinc-950 text-zinc-400 hover:text-white"
                            }`}
                          >
                            <span>{config.icon}</span>
                            <span>{config.label}</span>
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Transaction List */}
      {grouped.length > 0 ? (
        <div className="space-y-6">
          {grouped.map(([dateStr, dayExpenses]) => {
            const dayTotal = dayExpenses.reduce((s, e) => s + e.amount, 0);
            return (
              <motion.div
                key={dateStr}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                {/* Date Group Header */}
                <div className="flex items-center justify-between border-b border-zinc-900/60 pb-2">
                  <p className="text-xs font-bold text-zinc-400 tracking-tight">
                    {formatDate(dateStr)}
                  </p>
                  <span className="text-xs font-bold text-white px-2 py-0.5 rounded-lg bg-zinc-950 border border-zinc-900">
                    {formatCurrency(dayTotal)}
                  </span>
                </div>

                {/* Day Transactions list */}
                <div className="grid grid-cols-1 gap-2.5">
                  {dayExpenses.map((expense) => {
                    const catConfig = CATEGORY_CONFIG[expense.category];
                    const pmConfig = PAYMENT_MODE_CONFIG[expense.paymentMode];

                    return (
                      <Link
                        href={`/expenses/${expense.id}/edit`}
                        key={expense.id}
                        className="group relative flex items-center justify-between p-4 bg-zinc-950/40 border border-zinc-900 rounded-2xl transition-all duration-300 hover:border-zinc-800 hover:bg-zinc-900/10 overflow-hidden cursor-pointer"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          {/* Circle Icon accent glow */}
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0 border border-zinc-800 transition-all group-hover:scale-105"
                            style={{
                              background: `${catConfig?.color}08`,
                              borderColor: `${catConfig?.color}15`,
                            }}
                          >
                            {catConfig?.icon || "📌"}
                          </div>

                          {/* Transaction Details */}
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white tracking-tight group-hover:text-emerald-400 transition-colors truncate">
                              {expense.item}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border"
                                style={{
                                  background: `${catConfig?.color}10`,
                                  borderColor: `${catConfig?.color}20`,
                                  color: catConfig?.color,
                                }}
                              >
                                {catConfig?.label}
                              </span>
                              <span className="text-[9px] font-semibold text-zinc-500 uppercase">
                                {pmConfig?.label}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Amount & Arrow */}
                        <div className="flex items-center gap-3 shrink-0">
                          <p className="text-sm font-black text-white group-hover:text-emerald-400 transition-colors">
                            {formatCurrency(expense.amount)}
                          </p>
                          <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors group-hover:translate-x-0.5 group-hover:-translate-y-0.5 duration-200" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-zinc-900 bg-zinc-950/20 rounded-3xl">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-850 flex items-center justify-center mb-4">
            <Wallet className="w-7 h-7 text-zinc-600" />
          </div>
          <p className="text-sm font-bold text-zinc-400 mb-2">
            No expenses matching your criteria
          </p>
          <p className="text-xs text-zinc-600 mb-6">
            Try adjusting your search criteria or add new expenses
          </p>
          <Link
            href="/expenses/add"
            className="bg-emerald-500 hover:bg-emerald-600 text-black py-2 px-5 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95"
          >
            Add New Expense
          </Link>
        </div>
      )}
    </div>
  );
}
