"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Car, Fuel, Wrench } from "lucide-react";
import { formatCurrency, VEHICLE_TYPE_CONFIG, formatDate } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import Link from "next/link";

interface VehicleExpense {
  id: string;
  date: string;
  amount: number;
  type: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function VehicleClient({
  initialExpenses,
}: {
  initialExpenses: VehicleExpense[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expenses] = useState(initialExpenses);

  const now = new Date();
  const thisMonth = expenses.filter((e) => {
    const d = new Date(e.date);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  });
  const thisYear = expenses.filter(
    (e) => new Date(e.date).getFullYear() === now.getFullYear(),
  );

  const fuelThisMonth = thisMonth
    .filter((e) => e.type === "FUEL")
    .reduce((s, e) => s + e.amount, 0);
  const serviceThisYear = thisYear
    .filter((e) => e.type === "SERVICE")
    .reduce((s, e) => s + e.amount, 0);
  const insuranceThisYear = thisYear
    .filter((e) => e.type === "INSURANCE")
    .reduce((s, e) => s + e.amount, 0);
  const totalThisYear = thisYear.reduce((s, e) => s + e.amount, 0);

  const typeBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    thisYear.forEach((e) => {
      breakdown[e.type] = (breakdown[e.type] || 0) + e.amount;
    });
    return Object.entries(breakdown)
      .map(([key, value]) => ({
        name: VEHICLE_TYPE_CONFIG[key]?.label || key,
        value,
        color: VEHICLE_TYPE_CONFIG[key]?.color || "#6b7280",
      }))
      .sort((a, b) => b.value - a.value);
  }, [thisYear]);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Vehicle Expenses</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Track your vehicle costs
          </p>
        </div>
        <Link href="/expenses/add?category=VEHICLE" className="btn-primary">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Expense</span>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="glass-card-static p-4 metric-accent-amber">
          <p className="text-xs text-[var(--text-muted)] mb-1">Fuel (Month)</p>
          <p className="text-xl font-bold text-white">
            {formatCurrency(fuelThisMonth)}
          </p>
        </div>
        <div className="glass-card-static p-4 metric-accent-blue">
          <p className="text-xs text-[var(--text-muted)] mb-1">
            Service (Year)
          </p>
          <p className="text-xl font-bold text-white">
            {formatCurrency(serviceThisYear)}
          </p>
        </div>
        <div className="glass-card-static p-4 metric-accent-green">
          <p className="text-xs text-[var(--text-muted)] mb-1">
            Insurance (Year)
          </p>
          <p className="text-xl font-bold text-white">
            {formatCurrency(insuranceThisYear)}
          </p>
        </div>
        <div className="glass-card-static p-4 metric-accent-purple">
          <p className="text-xs text-[var(--text-muted)] mb-1">Total (Year)</p>
          <p className="text-xl font-bold text-white">
            {formatCurrency(totalThisYear)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Type Breakdown */}
        {typeBreakdown.length > 0 && (
          <div className="border border-zinc-900 bg-zinc-950/60 rounded-2xl p-5">
            <h3 className="text-xs uppercase tracking-wider font-bold text-zinc-400 mb-4">
              Breakdown by Type
            </h3>
            <div className="h-[200px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={82}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {typeBreakdown.map((e, i) => (
                      <Cell key={i} fill={e.color} />
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
                <p className="text-xs text-[var(--text-muted)] font-medium">
                  Total
                </p>
                <p className="text-lg font-bold text-white tracking-tight">
                  {formatCurrency(totalThisYear)}
                </p>
              </div>
            </div>
            <div className="space-y-2 mt-4 max-h-[140px] overflow-y-auto pr-1">
              {typeBreakdown.map((t) => (
                <div
                  key={t.name}
                  className="flex items-center justify-between text-xs py-0.5"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: t.color }}
                    />
                    <span className="text-[var(--text-secondary)] font-medium">
                      {t.name}
                    </span>
                  </div>
                  <span className="text-white font-semibold">
                    {formatCurrency(t.value)}{" "}
                    <span className="text-[var(--text-muted)] font-normal text-[10px]">
                      (
                      {totalThisYear > 0
                        ? Math.round((t.value / totalThisYear) * 100)
                        : 0}
                      %)
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Expenses */}
        <div className="border border-zinc-900 bg-zinc-950/60 rounded-2xl p-5">
          <h3 className="text-xs uppercase tracking-wider font-bold text-zinc-400 mb-4">
            Recent Vehicle Expenses
          </h3>
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1.5">
            {expenses.map((e) => {
              const config = VEHICLE_TYPE_CONFIG[e.type];
              return (
                <motion.div
                  key={e.id}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between py-1.5 border-b border-zinc-900/60 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8.5 h-8.5 rounded-xl flex items-center justify-center text-sm border border-zinc-900"
                      style={{ background: `${config?.color}15` }}
                    >
                      {config?.icon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">
                        {config?.label}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)] font-medium">
                        {e.notes || formatDate(e.date)}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-white">
                    {formatCurrency(e.amount)}
                  </p>
                </motion.div>
              );
            })}
          </div>
          {expenses.length === 0 && (
            <p className="text-xs text-[var(--text-muted)] text-center py-8">
              No vehicle expenses
            </p>
          )}
        </div>
      </div>

      {expenses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center mb-4">
            <Car className="w-7 h-7 text-[var(--text-muted)]" />
          </div>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            No vehicle expenses yet
          </p>
          <Link href="/expenses/add?category=VEHICLE" className="btn-primary">
            <Plus className="w-4 h-4" /> Add expense
          </Link>
        </div>
      )}
    </div>
  );
}
