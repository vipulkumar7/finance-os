"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Target, Calendar } from "lucide-react";
import { formatCurrency, formatCompactCurrency, formatDate } from "@/lib/utils";

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  icon: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

const GOAL_ICONS = ["🏠", "💍", "🛡️", "🏖️", "🎓", "🚗", "👶", "💰", "🎯", "🌟"];

export default function GoalsClient({ initialGoals }: { initialGoals: Goal[] }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState(initialGoals);

  const [form, setForm] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    targetDate: "",
    icon: "🎯",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          targetAmount: Number(form.targetAmount),
          currentAmount: Number(form.currentAmount) || 0,
        }),
      });
      if (res.ok) {
        setShowForm(false);
        window.location.reload();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this goal?")) return;
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
    window.location.reload();
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Financial Goals</h1>
          <p className="text-sm text-[var(--text-muted)]">Track your financial milestones</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Goal</span>
        </button>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="glass-card-static p-6 space-y-4"
        >
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-2 block">Icon</label>
            <div className="flex gap-2 flex-wrap">
              {GOAL_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setForm({ ...form, icon })}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border transition-all ${
                    form.icon === icon
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-[var(--border-primary)] bg-[var(--bg-secondary)]"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Goal Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="form-input" placeholder="e.g., House Fund" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[var(--text-muted)] mb-1 block">Target Amount (₹)</label>
              <input type="number" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} className="form-input" required min="1" />
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] mb-1 block">Current Amount (₹)</label>
              <input type="number" value={form.currentAmount} onChange={(e) => setForm({ ...form, currentAmount: e.target.value })} className="form-input" min="0" />
            </div>
          </div>
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Target Date</label>
            <input type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} className="form-input" required />
          </div>
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="form-input min-h-[60px] resize-none" placeholder="Optional description" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? "Saving..." : "Create Goal"}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </motion.form>
      )}

      {/* Goal Cards */}
      {goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const progress = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;
            const remaining = goal.targetAmount - goal.currentAmount;

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center text-2xl">
                      {goal.icon}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">{goal.name}</h3>
                      {goal.description && (
                        <p className="text-xs text-[var(--text-muted)]">{goal.description}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-lg font-bold text-emerald-400">{progress}%</span>
                </div>

                <div className="progress-bar mb-3">
                  <div className="progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-muted)]">
                    {formatCompactCurrency(goal.currentAmount)} / {formatCompactCurrency(goal.targetAmount)}
                  </span>
                  <span className="text-[var(--text-muted)] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(goal.targetDate)}
                  </span>
                </div>

                {remaining > 0 && (
                  <p className="text-xs text-[var(--text-muted)] mt-2">
                    {formatCompactCurrency(remaining)} remaining
                  </p>
                )}

                <button
                  onClick={() => handleDelete(goal.id)}
                  className="mt-3 text-xs text-red-400/60 hover:text-red-400 transition-colors"
                >
                  Remove goal
                </button>
              </motion.div>
            );
          })}
        </div>
      ) : (
        !showForm && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center mb-4">
              <Target className="w-7 h-7 text-[var(--text-muted)]" />
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-4">No goals set yet</p>
            <button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-4 h-4" /> Create a goal</button>
          </div>
        )
      )}
    </div>
  );
}
