"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Filter,
  ChevronDown,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  formatCurrency,
  formatDate,
  CATEGORY_CONFIG,
  PAYMENT_MODE_CONFIG,
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
}: {
  initialExpenses: Expense[];
}) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [expenses] = useState(initialExpenses);

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (search && !e.item.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (categoryFilter && e.category !== categoryFilter) return false;
      if (paymentFilter && e.paymentMode !== paymentFilter) return false;
      return true;
    });
  }, [expenses, search, categoryFilter, paymentFilter]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, Expense[]> = {};
    filtered.forEach((e) => {
      const dateKey = new Date(e.date).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(e);
    });
    return Object.entries(groups);
  }, [filtered]);

  const totalFiltered = filtered.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Expenses</h1>
          <p className="text-sm text-[var(--text-muted)]">
            {filtered.length} transactions · {formatCurrency(totalFiltered)}
          </p>
        </div>
        <Link href="/expenses/add" className="btn-primary">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Expense</span>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-10"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary relative ${showFilters ? "!border-emerald-500/50 !text-emerald-400" : ""}`}
        >
          <Filter className="w-4 h-4" />
          {(categoryFilter || paymentFilter) && (
            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
          )}
        </button>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="glass-card-static p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--text-secondary)]">
                  Filters
                </span>
                {(categoryFilter || paymentFilter) && (
                  <button
                    onClick={() => {
                      setCategoryFilter("");
                      setPaymentFilter("");
                    }}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="form-input"
                >
                  <option value="">All Categories</option>
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.icon} {config.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Mode */}
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">
                  Payment Mode
                </label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="form-input"
                >
                  <option value="">All Payment Modes</option>
                  {Object.entries(PAYMENT_MODE_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.icon} {config.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expense List */}
      {grouped.length > 0 ? (
        <div className="space-y-6">
          {grouped.map(([dateStr, dayExpenses]) => {
            const dayTotal = dayExpenses.reduce((s, e) => s + e.amount, 0);
            return (
              <motion.div
                key={dateStr}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Date Header */}
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-[var(--text-secondary)]">
                    {formatDate(dateStr)}
                  </p>
                  <p className="text-xs font-medium text-[var(--text-muted)]">
                    {formatCurrency(dayTotal)}
                  </p>
                </div>

                {/* Day Expenses */}
                <div className="space-y-2">
                  {dayExpenses.map((expense) => {
                    const catConfig = CATEGORY_CONFIG[expense.category];
                    const pmConfig = PAYMENT_MODE_CONFIG[expense.paymentMode];

                    return (
                      <Link
                        href={`/expenses/${expense.id}/edit`}
                        key={expense.id}
                        className="glass-card flex items-center gap-4 p-4 cursor-pointer"
                      >
                        {/* Category Icon */}
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                          style={{
                            background: `${catConfig?.color}15`,
                          }}
                        >
                          {catConfig?.icon || "📌"}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {expense.item}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{
                                background: `${catConfig?.color}15`,
                                color: catConfig?.color,
                              }}
                            >
                              {catConfig?.label}
                            </span>
                            <span className="text-xs text-[var(--text-muted)]">
                              {pmConfig?.label}
                            </span>
                          </div>
                        </div>

                        {/* Amount */}
                        <p className="text-sm font-bold text-white shrink-0">
                          {formatCurrency(expense.amount)}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center mb-4">
            <Receipt className="w-7 h-7 text-[var(--text-muted)]" />
          </div>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            {search || categoryFilter || paymentFilter
              ? "No expenses match your filters"
              : "No expenses yet"}
          </p>
          <Link href="/expenses/add" className="btn-primary">
            <Plus className="w-4 h-4" />
            Add your first expense
          </Link>
        </div>
      )}
    </div>
  );
}

function Receipt(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 17.5v-11" />
    </svg>
  );
}
