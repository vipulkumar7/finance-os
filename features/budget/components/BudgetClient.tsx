"use client";

import { useState } from "react";
import { Plus, Check, X, Edit2, Trash2 } from "lucide-react";
import { formatCurrency, formatCompactCurrency } from "@/lib/utils";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

interface BudgetAllocation {
  id: string;
  name: string;
  amount: number;
  type: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

const INVESTMENT_TYPES = [
  "sip",
  "mutual funds",
  "stocks",
  "fd",
  "nps",
  "epf",
  "gold",
  "arbitrage",
  "liquid fund",
];

const isSIPType = (type: string) => {
  if (!type) return false;
  return INVESTMENT_TYPES.includes(type.toLowerCase());
};

const isEMIType = (type: string) => {
  if (!type) return false;
  return type.toLowerCase() === "emi";
};

const isExpenseType = (type: string) => {
  if (!type) return false;
  return (
    type.toLowerCase() === "expense" ||
    type.toLowerCase() === "expenses" ||
    type.toLowerCase() === "expense"
  );
};

export default function BudgetClient({
  initialBudget,
}: {
  initialBudget: BudgetAllocation[];
}) {
  // Budget management state
  const [budget, setBudget] = useState<BudgetAllocation[]>(initialBudget || []);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editType, setEditType] = useState("SIP");

  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newType, setNewType] = useState("SIP");
  const [saving, setSaving] = useState(false);

  const totalBudget = (budget || []).reduce(
    (sum, item) => sum + item.amount,
    0,
  );
  const totalSIPBudget = (budget || [])
    .filter((item) => isSIPType(item.type))
    .reduce((sum, item) => sum + item.amount, 0);
  const totalEMIBudget = (budget || [])
    .filter((item) => isEMIType(item.type))
    .reduce((sum, item) => sum + item.amount, 0);
  const totalGeneralBudget = (budget || [])
    .filter((item) => !isSIPType(item.type) && !isEMIType(item.type))
    .reduce((sum, item) => sum + item.amount, 0);

  const budgetTypeData = [
    { name: "SIPs", value: totalSIPBudget, color: "#10b981" },
    { name: "EMIs", value: totalEMIBudget, color: "#f59e0b" },
    { name: "Expenses", value: totalGeneralBudget, color: "#ef4444" },
  ].filter((item) => item.value > 0);

  const startEditingBudget = (item: BudgetAllocation) => {
    setEditingBudgetId(item.id);
    setEditName(item.name);
    setEditAmount(item.amount.toString());
    setEditType(item.type);
  };

  const saveBudgetEdit = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/budget", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: editName,
          amount: parseFloat(editAmount) || 0,
          type: editType,
        }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      setBudget((prev) =>
        prev.map((item) => (item.id === id ? updated : item)),
      );
      setEditingBudgetId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const deleteBudgetItem = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this monthly recurring outflow?",
      )
    )
      return;
    try {
      const res = await fetch(`/api/budget?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setBudget((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete item.");
    }
  };

  const addBudgetItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newAmount) return;
    setSaving(true);
    try {
      const res = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          amount: parseFloat(newAmount) || 0,
          type: newType,
        }),
      });
      if (!res.ok) throw new Error("Failed to add");
      const added = await res.json();
      setBudget((prev) =>
        [...prev, added].sort(
          (a, b) =>
            a.type.localeCompare(b.type) || a.name.localeCompare(b.name),
        ),
      );
      setNewName("");
      setNewAmount("");
    } catch (err) {
      console.error(err);
      alert("Failed to add item.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">
            Monthly Budget & Outflow
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Manage your monthly recurring plan (SIPs, EMIs, expenses)
          </p>
        </div>
      </div>

      {/* Unified Stats Header Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card-static p-5 metric-accent-green">
          <p className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
            Total Monthly Outflow
          </p>
          <h3 className="text-2xl font-extrabold text-white mt-1">
            {formatCurrency(totalBudget)}
          </h3>
          <p className="text-[10px] text-emerald-400 font-medium mt-1">
            Total recurring commitments
          </p>
        </div>

        <div className="glass-card-static p-5 metric-accent-purple">
          <p className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
            Investment (Planned Monthly SIP Target)
          </p>
          <h3 className="text-2xl font-extrabold text-white mt-1">
            {formatCurrency(totalSIPBudget)}
          </h3>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">
            Mutual funds, stocks & other assets
          </p>
        </div>

        <div className="glass-card-static p-5 metric-accent-amber">
          <p className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
            EMIs & General Expenses
          </p>
          <h3 className="text-2xl font-extrabold text-white mt-1">
            {formatCurrency(totalEMIBudget + totalGeneralBudget)}
          </h3>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">
            Loans, leases & daily budgets
          </p>
        </div>
      </div>

      {/* Main Budget Outflows Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart card */}
        <div className="lg:col-span-1 glass-card-static p-5">
          <h3 className="text-sm font-semibold text-white mb-2">
            Outflow Distribution
          </h3>
          <div className="h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={budgetTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {budgetTypeData.map((entry, index) => (
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
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase">
                Outflow
              </p>
              <p className="text-base font-extrabold text-white tracking-tight">
                {formatCompactCurrency(totalBudget)}
              </p>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="space-y-2 mt-4">
            {budgetTypeData.map((type) => (
              <div
                key={type.name}
                className="flex items-center justify-between text-xs py-0.5"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: type.color }}
                  />
                  <span className="text-[var(--text-secondary)] font-medium">
                    {type.name}
                  </span>
                </div>
                <span className="text-white font-semibold">
                  {formatCurrency(type.value)}{" "}
                  <span className="text-[var(--text-muted)] font-normal text-[10px]">
                    (
                    {totalBudget > 0
                      ? Math.round((type.value / totalBudget) * 100)
                      : 0}
                    %)
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Itemized List & Form Manager */}
        <div className="lg:col-span-2 glass-card-static p-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                Outflow Itemized List
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[var(--text-muted)]">
                {budget.length} items
              </span>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-zinc-800">
              {budget.map((item) => {
                const isEditing = editingBudgetId === item.id;
                const isSIP = isSIPType(item.type);
                const isEMI = isEMIType(item.type);
                const typeColor = isSIP
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : isEMI
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/20";

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3.5 bg-zinc-950/40 border border-zinc-900 rounded-xl transition-all duration-200"
                  >
                    {isEditing ? (
                      <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                          placeholder="Item Name"
                        />
                        <input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value.replace(/^0+(?=\d)/, ''))}
                          className="w-full sm:w-28 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                          placeholder="Amount"
                        />
                        <select
                          value={editType}
                          onChange={(e) => setEditType(e.target.value)}
                          className="w-full sm:w-28 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500 cursor-pointer"
                        >
                          <option value="SIP">SIP</option>
                          <option value="EMI">EMI</option>
                          <option value="Expense">Expense</option>
                          <option value="Mutual Funds">Mutual Funds</option>
                          <option value="Stocks">Stocks</option>
                          <option value="Gold">Gold</option>
                          <option value="Arbitrage">Arbitrage</option>
                          <option value="NPS">NPS</option>
                          <option value="EPF">EPF</option>
                          <option value="FD">FD</option>
                          <option value="Liquid Fund">Liquid Fund</option>
                        </select>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => saveBudgetEdit(item.id)}
                            disabled={saving}
                            className="bg-emerald-500 hover:bg-emerald-600 text-black px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingBudgetId(null)}
                            className="bg-zinc-900 hover:bg-zinc-850 text-zinc-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${typeColor}`}
                          >
                            {item.type}
                          </span>
                          <p className="text-xs font-semibold text-white tracking-tight">
                            {item.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-bold text-white">
                            {formatCurrency(item.amount)}
                          </span>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => startEditingBudget(item)}
                              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white transition-colors"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => deleteBudgetItem(item.id)}
                              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add budget item form */}
          <form
            onSubmit={addBudgetItem}
            className="border-t border-zinc-900 pt-4 flex flex-col sm:flex-row gap-3"
          >
            <input
              type="text"
              placeholder="e.g. Bandhan Small Cap, Car Loan"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-900 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
              required
            />
            <input
              type="number"
              placeholder="Amount (₹)"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value.replace(/^0+(?=\d)/, ''))}
              className="w-full sm:w-28 bg-zinc-950 border border-zinc-900 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
              required
              min="1"
            />
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="w-full sm:w-28 bg-zinc-950 border border-zinc-900 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="SIP">SIP</option>
              <option value="EMI">EMI</option>
              <option value="Expense">Expense</option>
              <option value="Mutual Funds">Mutual Funds</option>
              <option value="Stocks">Stocks</option>
              <option value="Gold">Gold</option>
              <option value="Arbitrage">Arbitrage</option>
              <option value="NPS">NPS</option>
              <option value="EPF">EPF</option>
              <option value="FD">FD</option>
              <option value="Liquid Fund">Liquid Fund</option>
            </select>
            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-black py-2 px-4 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
