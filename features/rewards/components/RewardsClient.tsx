"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import { Award, CreditCard, Edit2, Check, X, Sparkles, Shield, Smartphone, Layers, Flame } from "lucide-react";

interface CardReward {
  id: string;
  cardName: string;
  points: number;
  valueInInr: number;
  notes: string | null;
  updatedAt: string;
}

interface Props {
  initialRewards: CardReward[];
}

interface CardConfig {
  gradient: string;
  accent: string;
  icon: any;
  textColor: string;
  brand: string;
}

const CARD_CONFIGS: Record<string, CardConfig> = {
  "SBI Cashback Credit Card": {
    gradient: "from-blue-600 to-indigo-900",
    accent: "text-blue-300 bg-blue-500/20",
    icon: CreditCard,
    textColor: "text-blue-100",
    brand: "SBI Card"
  },
  "HDFC Regalia Gold Credit Card": {
    gradient: "from-amber-600 via-zinc-800 to-zinc-950",
    accent: "text-amber-400 bg-amber-500/20",
    icon: Shield,
    textColor: "text-amber-100",
    brand: "HDFC Bank"
  },
  "HDFC UPI RuPay Credit Card": {
    gradient: "from-teal-600 to-cyan-900",
    accent: "text-teal-300 bg-teal-500/20",
    icon: Smartphone,
    textColor: "text-teal-100",
    brand: "HDFC Bank"
  },
  "Yes Bank Ace Credit Card": {
    gradient: "from-sky-500 to-indigo-800",
    accent: "text-sky-300 bg-sky-500/20",
    icon: Flame,
    textColor: "text-sky-100",
    brand: "Yes Bank"
  },
  "HDFC Millennia Debit Card": {
    gradient: "from-pink-500 via-purple-700 to-indigo-900",
    accent: "text-pink-300 bg-pink-500/20",
    icon: Layers,
    textColor: "text-pink-100",
    brand: "HDFC Bank"
  }
};

const DEFAULT_CONFIG: CardConfig = {
  gradient: "from-zinc-800 to-zinc-950",
  accent: "text-emerald-400 bg-emerald-500/20",
  icon: Award,
  textColor: "text-zinc-100",
  brand: "Card"
};

export default function RewardsClient({ initialRewards }: Props) {
  const [rewards, setRewards] = useState<CardReward[]>(initialRewards);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  
  // Form edit states
  const [editPoints, setEditPoints] = useState<string>("");
  const [editValue, setEditValue] = useState<string>("");
  const [editNotes, setEditNotes] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const totalValue = rewards.reduce((sum, r) => sum + r.valueInInr, 0);

  const startEditing = (card: CardReward) => {
    setEditingCardId(card.id);
    setEditPoints(card.points.toString());
    setEditValue(card.valueInInr.toString());
    setEditNotes(card.notes || "");
  };

  const cancelEditing = () => {
    setEditingCardId(null);
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/rewards", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          points: parseFloat(editPoints) || 0,
          valueInInr: parseFloat(editValue) || 0,
          notes: editNotes
        })
      });

      if (!res.ok) throw new Error("Failed to save changes");
      
      const updated = await res.json();
      
      setRewards(prev =>
        prev.map(r => (r.id === id ? { ...updated, updatedAt: updated.updatedAt } : r))
      );
      setEditingCardId(null);
    } catch (err) {
      console.error(err);
      alert("Error saving rewards points data.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <span>Card Rewards Tracker</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Manage and track points, cashback, and cash values for your credit & debit cards
          </p>
        </div>

        {/* Total Aggregated Wealth Card */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Total Rewards Value</p>
            <p className="text-lg font-black text-white mt-0.5">{formatCurrency(totalValue)}</p>
          </div>
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {rewards.map((reward) => {
          const config = CARD_CONFIGS[reward.cardName] || DEFAULT_CONFIG;
          const Icon = config.icon;
          const isEditing = editingCardId === reward.id;

          return (
            <motion.div
              key={reward.id}
              layout
              className="border border-zinc-900 bg-zinc-950/40 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between"
            >
              {/* Premium Gradient Card Design */}
              <div className={`bg-gradient-to-br ${config.gradient} p-5 relative overflow-hidden flex flex-col justify-between h-[150px]`}>
                <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />

                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest font-black text-white/50">{config.brand}</span>
                    <h3 className="text-sm font-bold text-white tracking-tight leading-snug mt-0.5">{reward.cardName}</h3>
                  </div>
                  <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center border border-white/10 ${config.accent}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                </div>

                <div className="flex items-end justify-between relative z-10 mt-4">
                  <div>
                    <p className="text-[9px] uppercase font-bold text-white/60">Points / Cashback</p>
                    <p className="text-xl font-black text-white tracking-tight">{reward.points.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase font-bold text-white/60">Value (INR)</p>
                    <p className="text-xl font-black text-white tracking-tight">{formatCurrency(reward.valueInInr)}</p>
                  </div>
                </div>
              </div>

              {/* Edit Form or Detail Block */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <AnimatePresence mode="wait">
                  {isEditing ? (
                    <motion.div
                      key="edit"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="space-y-3"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-zinc-400">Points</label>
                          <input
                            type="number"
                            value={editPoints}
                            onChange={(e) => setEditPoints(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none focus:border-emerald-500 mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-zinc-400">Value (INR)</label>
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none focus:border-emerald-500 mt-1"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-zinc-400">Notes / Remarks</label>
                        <input
                          type="text"
                          placeholder="Add comments or reward redemption info..."
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none focus:border-emerald-500 mt-1"
                        />
                      </div>

                      <div className="flex gap-2 pt-1.5">
                        <button
                          onClick={() => saveEdit(reward.id)}
                          disabled={saving}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-black py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                        >
                          {saving ? "Saving..." : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Save</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="bg-zinc-900 hover:bg-zinc-850 text-zinc-300 py-2 px-3 rounded-xl text-xs font-bold transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="view"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="flex flex-col justify-between flex-1 space-y-4"
                    >
                      <div className="space-y-2">
                        <p className="text-[11px] text-[var(--text-muted)] font-medium italic min-h-[16px]">
                          {reward.notes || "No notes added yet."}
                        </p>
                        <p className="text-[9px] text-zinc-600 font-semibold uppercase">
                          Last Updated: {new Date(reward.updatedAt).toLocaleDateString()}
                        </p>
                      </div>

                      <button
                        onClick={() => startEditing(reward)}
                        className="w-full bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-zinc-850"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Update Rewards</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
