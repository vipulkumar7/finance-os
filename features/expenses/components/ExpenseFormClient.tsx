"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import {
  CATEGORY_CONFIG,
  PAYMENT_MODE_CONFIG,
  VEHICLE_TYPE_CONFIG,
} from "@/lib/utils";
import Link from "next/link";

const QUICK_CHIPS = [
  {
    label: "🥩 Mutton",
    values: {
      item: "Mutton",
      category: "MEAT",
      amount: 700,
      paymentMode: "PAYZAPP",
    },
  },
  {
    label: "🚗 i20 Petrol",
    values: {
      item: "i20 Petrol",
      category: "VEHICLE",
      amount: 500,
      paymentMode: "HDFC_UPI_CC",
      vehicleType: "FUEL",
    },
  },
  {
    label: "💊 Medicine",
    values: {
      item: "Medicine",
      category: "MEDICAL",
      amount: 200,
      paymentMode: "HDFC_UPI_CC",
    },
  },
  {
    label: "📦 Online Grocery",
    values: {
      item: "Online Grocery",
      category: "GROCERY_ONLINE",
      amount: 500,
      paymentMode: "FLIPKART_GIFT_CARD",
    },
  },
  {
    label: "🛒 Grocery",
    values: {
      item: "Grocery",
      category: "GROCERY_OFFLINE",
      amount: 500,
      paymentMode: "HDFC_UPI_CC",
    },
  },
  {
    label: "📄 Bills",
    values: {
      item: "Bills",
      category: "BILLS",
      amount: 1000,
      paymentMode: "AMAZON_GIFT_CARD",
    },
  },
  {
    label: "🛍️ Shopping",
    values: {
      item: "Shopping",
      category: "SHOPPING",
      amount: 1000,
      paymentMode: "SBI_CC",
    },
  },
  {
    label: "🍽️ Eating Out",
    values: {
      item: "Eating Out",
      category: "EATING_OUT",
      amount: 500,
      paymentMode: "HDFC_UPI_CC",
    },
  },
  {
    label: "🍿 Snacks",
    values: {
      item: "Snacks",
      category: "SNACKS",
      amount: 100,
      paymentMode: "HDFC_UPI_CC",
    },
  },
];

export default function ExpenseFormClient({
  initialData,
}: {
  initialData?: {
    id: string;
    date: string;
    item: string;
    amount: number;
    category: string;
    paymentMode: string;
    notes: string | null;
    vehicleType?: string | null;
  };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetCategory = searchParams.get("category");
  const isEdit = !!initialData;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    date: initialData?.date
      ? new Date(initialData.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    item: initialData?.item || "",
    amount: initialData?.amount || "",
    category: initialData?.category || presetCategory || "OTHERS",
    paymentMode: initialData?.paymentMode || "CASH",
    vehicleType: initialData?.vehicleType || "FUEL",
    notes: initialData?.notes || "",
  });

interface QuickChipValues {
  item: string;
  category: string;
  amount: number;
  paymentMode: string;
  vehicleType?: string;
}

  const handleChip = (values: QuickChipValues) => {
    setForm((prev) => ({
      ...prev,
      item: values.item,
      category: values.category,
      amount: values.amount,
      paymentMode: values.paymentMode,
      vehicleType: values.vehicleType || "FUEL",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        vehicleType: form.category === "VEHICLE" ? form.vehicleType : undefined,
      };

      const url = isEdit ? `/api/expenses/${initialData!.id}` : "/api/expenses";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      router.push("/expenses");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!initialData?.id) return;
    setShowConfirm(false);
    setLoading(true);

    try {
      await fetch(`/api/expenses/${initialData.id}`, { method: "DELETE" });
      router.push("/expenses");
      router.refresh();
    } catch {
      setError("Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/expenses"
          className="w-9 h-9 rounded-xl bg-[var(--bg-card)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-muted)] hover:text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-xl font-bold text-white">
          {isEdit ? "Edit Expense" : "Add Expense"}
        </h1>
      </div>

      {/* Quick Chips */}
      {!isEdit && (
        <div className="mb-6">
          <p className="text-xs text-[var(--text-muted)] mb-2">Quick Add</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip.label}
                onClick={() => handleChip(chip.values)}
                className={`chip ${
                  form.item === chip.values.item
                    ? "chip-active"
                    : "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-primary)]"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Form */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-static p-6 space-y-4"
      >
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Date */}
        <div>
          <label className="text-xs text-[var(--text-muted)] mb-1 block">
            Date
          </label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="form-input"
            required
          />
        </div>

        {/* Item */}
        <div>
          <label className="text-xs text-[var(--text-muted)] mb-1 block">
            Item
          </label>
          <input
            type="text"
            value={form.item}
            onChange={(e) => setForm({ ...form, item: e.target.value })}
            placeholder="What did you spend on?"
            className="form-input"
            required
          />
        </div>

        {/* Amount */}
        <div>
          <label className="text-xs text-[var(--text-muted)] mb-1 block">
            Amount (₹)
          </label>
          <input
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="0"
            className="form-input text-2xl font-bold"
            required
            min="1"
            step="1"
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-xs text-[var(--text-muted)] mb-1 block">
            Category
          </label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="form-input"
          >
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.icon} {config.label}
              </option>
            ))}
          </select>
        </div>

        {/* Vehicle Expense Type (Shown only if Category is VEHICLE) */}
        {form.category === "VEHICLE" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <label className="text-xs text-[var(--text-muted)] mb-1 block">
              Vehicle Expense Type
            </label>
            <select
              value={form.vehicleType}
              onChange={(e) =>
                setForm({ ...form, vehicleType: e.target.value })
              }
              className="form-input"
            >
              {Object.entries(VEHICLE_TYPE_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.icon} {config.label}
                </option>
              ))}
            </select>
          </motion.div>
        )}

        {/* Payment Mode */}
        <div>
          <label className="text-xs text-[var(--text-muted)] mb-1 block">
            Payment Mode
          </label>
          <select
            value={form.paymentMode}
            onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
            className="form-input"
          >
            {Object.entries(PAYMENT_MODE_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.icon} {config.label}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs text-[var(--text-muted)] mb-1 block">
            Notes (optional)
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Any additional notes..."
            className="form-input min-h-[80px] resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isEdit ? "Update" : "Save"} Expense
          </button>

          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="btn-secondary text-red-400 hover:!bg-red-500/10"
            >
              Delete
            </button>
          )}
        </div>
      </motion.form>

      {/* Premium Confirm Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="glass-card-elevated w-full max-w-sm p-6 text-center space-y-6 !border-red-500/20"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">Delete Expense?</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Are you sure you want to delete this expense? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="btn-primary !bg-red-500/90 hover:!bg-red-500 text-white flex-1"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
