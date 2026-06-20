"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, Calendar, DollarSign, ArrowRight } from "lucide-react";
import { formatCurrency, formatDate, CATEGORY_CONFIG, VEHICLE_TYPE_CONFIG } from "@/lib/utils";
import Link from "next/link";

interface SearchResultExpense {
  id: string;
  item: string;
  amount: number;
  category: string;
  date: string;
}

interface SearchResultVehicle {
  id: string;
  type: string;
  amount: number;
  notes: string;
  date: string;
}

interface SearchResults {
  expenses: SearchResultExpense[];
  vehicle: SearchResultVehicle[];
}

export default function SearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({ expenses: [], vehicle: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setResults({ expenses: [], vehicle: [] });
    }
  }, [isOpen]);

  // Handle keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Debounced API search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ expenses: [], vehicle: [] });
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="w-full max-w-2xl bg-zinc-950/80 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-2xl z-10"
          >
            {/* Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-zinc-800 gap-3">
              <Search className="w-5 h-5 text-zinc-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search expenses, vehicle entries..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent border-0 text-white placeholder-zinc-500 focus:outline-none focus:ring-0 text-sm"
              />
              {loading ? (
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
              ) : query ? (
                <button onClick={() => setQuery("")} className="text-zinc-500 hover:text-white shrink-0">
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <span className="text-xs text-zinc-500 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded font-mono shrink-0">
                  ESC
                </span>
              )}
            </div>

            {/* Results Area */}
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
              {query.trim().length < 2 ? (
                <div className="text-center py-8 text-zinc-500 text-xs">
                  Type at least 2 characters to search...
                </div>
              ) : results.expenses.length === 0 && results.vehicle.length === 0 && !loading ? (
                <div className="text-center py-8 text-zinc-500 text-xs">
                  No results found for &ldquo;{query}&rdquo;
                </div>
              ) : (
                <>
                  {/* Expenses Results */}
                  {results.expenses.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider px-1">
                        Expenses
                      </div>
                      <div className="space-y-1">
                        {results.expenses.map((expense) => {
                          const config = CATEGORY_CONFIG[expense.category] || CATEGORY_CONFIG.OTHERS;
                          return (
                            <Link
                              key={expense.id}
                              href={`/expenses/${expense.id}/edit`}
                              onClick={onClose}
                              className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all group"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                                  style={{ backgroundColor: `${config.color}15` }}
                                >
                                  {config.icon}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">
                                    {expense.item}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                                    <span>{config.label}</span>
                                    <span>•</span>
                                    <span>{formatDate(expense.date)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-white">
                                  {formatCurrency(expense.amount)}
                                </span>
                                <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Vehicle Expenses Results */}
                  {results.vehicle.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider px-1">
                        Vehicle Expenses
                      </div>
                      <div className="space-y-1">
                        {results.vehicle.map((entry) => {
                          const config = VEHICLE_TYPE_CONFIG[entry.type] || VEHICLE_TYPE_CONFIG.FUEL;
                          return (
                            <Link
                              key={entry.id}
                              href="/vehicle"
                              onClick={onClose}
                              className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all group"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                                  style={{ backgroundColor: `${config.color}15` }}
                                >
                                  {config.icon}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                                    {entry.notes || config.label}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                                    <span>{config.label}</span>
                                    <span>•</span>
                                    <span>{formatDate(entry.date)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-white">
                                  {formatCurrency(entry.amount)}
                                </span>
                                <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
