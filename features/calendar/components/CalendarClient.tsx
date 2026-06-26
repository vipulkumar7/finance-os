"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency, CATEGORY_CONFIG, getMonthName } from "@/lib/utils";
import { X, Calendar } from "lucide-react";

interface DailyData {
  [date: string]: {
    total: number;
    items: { item: string; amount: number; category: string }[];
  };
}

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

function getColor(amount: number, max: number): string {
  if (amount === 0) return "rgba(255,255,255,0.03)";
  const intensity = Math.min(amount / max, 1);
  if (intensity < 0.25) return "rgba(16, 185, 129, 0.2)";
  if (intensity < 0.5) return "rgba(16, 185, 129, 0.4)";
  if (intensity < 0.75) return "rgba(16, 185, 129, 0.65)";
  return "rgba(16, 185, 129, 0.9)";
}

export default function CalendarClient({
  dailyData,
  year,
}: {
  dailyData: DailyData;
  year: number;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const maxSpend = useMemo(() => {
    return Math.max(...Object.values(dailyData).map((d) => d.total), 1);
  }, [dailyData]);

  // Generate 12 months structure
  const monthsData = useMemo(() => {
    const result = [];
    for (let m = 0; m < 12; m++) {
      const weeksInMonth = [];
      let currentWeek = Array(7).fill(null);

      const start = new Date(year, m, 1);
      const end = new Date(year, m + 1, 0); // Last day of month

      // Day of week for first day (1 = Monday, 7 = Sunday)
      const startDay = start.getDay() || 7;
      
      // Pad the start week
      for (let i = 1; i < startDay; i++) {
        currentWeek[i - 1] = { date: "", day: 0 };
      }

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0];
        const dayOfWeek = d.getDay() || 7;
        
        currentWeek[dayOfWeek - 1] = {
          date: dateStr,
          day: d.getDate(),
        };

        if (dayOfWeek === 7) {
          weeksInMonth.push(currentWeek);
          currentWeek = Array(7).fill(null);
        }
      }

      if (currentWeek.some(c => c !== null)) {
        // Pad the end week
        for (let i = 0; i < 7; i++) {
          if (currentWeek[i] === null) {
            currentWeek[i] = { date: "", day: 0 };
          }
        }
        weeksInMonth.push(currentWeek);
      }

      result.push({
        monthIndex: m,
        name: getMonthName(m + 1),
        weeks: weeksInMonth,
      });
    }
    return result;
  }, [year]);

  const selectedData = selected ? dailyData[selected] : null;

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-400" />
          <span>Spending Heatmap</span>
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {year} · Interactive monthly grid display
        </p>
      </div>

      {/* Main Grid Wrapper */}
      <div className="border border-zinc-900 bg-zinc-950/60 rounded-2xl p-5 md:p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.01),transparent_50%)] pointer-events-none" />

        {/* 12-Month Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6 relative z-10">
          {monthsData.map((m) => (
            <div
              key={m.monthIndex}
              className="border border-zinc-900 bg-zinc-950/30 rounded-2xl p-4 flex flex-col items-center shadow-inner"
            >
              <h3 className="text-xs uppercase tracking-wider font-bold text-zinc-300 mb-3 self-start pl-1">
                {m.name}
              </h3>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1.5 mb-2 w-full max-w-[170px]">
                {DAYS.map((d, i) => (
                  <div key={i} className="text-[9px] font-bold text-[var(--text-muted)] text-center h-4 flex items-center justify-center">
                    {d}
                  </div>
                ))}
              </div>

              {/* Monthly calendar cells */}
              <div className="flex flex-col gap-1.5 w-full max-w-[170px]">
                {m.weeks.map((week, wi) => (
                  <div key={wi} className="grid grid-cols-7 gap-1.5">
                    {week.map((cell, ci) => {
                      if (!cell || !cell.date) {
                        return <div key={ci} className="w-[19px] h-[19px] bg-transparent" />;
                      }
                      const data = dailyData[cell.date];
                      const amount = data?.total || 0;
                      const isFuture = new Date(cell.date) > new Date();

                      return (
                        <button
                          key={ci}
                          onClick={() => !isFuture && setSelected(cell.date)}
                          disabled={isFuture}
                          className="w-[19px] h-[19px] rounded-full text-[8px] font-bold transition-all duration-200 hover:scale-125 hover:ring-2 hover:ring-emerald-400 hover:z-10 cursor-pointer disabled:cursor-default flex items-center justify-center border border-zinc-900/30"
                          style={{
                            background: isFuture ? "rgba(255,255,255,0.01)" : getColor(amount, maxSpend),
                            color: isFuture ? "transparent" : amount > 0 ? "#ffffff" : "#52525b",
                          }}
                          title={`${cell.date}: ${formatCurrency(amount)}`}
                        >
                          {cell.day}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-6 border-t border-zinc-900/60 pt-4 relative z-10">
          <span className="text-[10px] font-bold text-[var(--text-muted)]">Less</span>
          {[0, 0.25, 0.5, 0.75, 1].map((level) => (
            <div
              key={level}
              className="w-[11px] h-[11px] rounded-full border border-zinc-950"
              style={{ background: getColor(level * maxSpend, maxSpend) }}
            />
          ))}
          <span className="text-[10px] font-bold text-[var(--text-muted)]">More</span>
        </div>
      </div>

      {/* Day Breakdown Modal */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={() => setSelected(null)} />
            
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md border border-zinc-900 bg-zinc-950/95 backdrop-blur-xl rounded-2xl p-5 md:p-6 shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.03),transparent_50%)] pointer-events-none" />

              <div className="flex flex-row items-center justify-between gap-3 mb-5 pb-4 border-b border-zinc-900 relative z-10">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 font-bold">Breakdown for</p>
                  <h3 className="text-sm font-bold text-white mt-0.5">{selected}</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 font-bold">Total Spent</p>
                    <p className="text-sm font-bold text-emerald-400 mt-0.5">
                      {formatCurrency(selectedData?.total || 0)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[var(--text-muted)] hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto relative z-10 pr-1">
                {!selectedData || selectedData.items.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-xs text-[var(--text-muted)] font-medium">No expenses recorded for this date.</p>
                  </div>
                ) : (
                  selectedData.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 border-b border-zinc-900/60 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{CATEGORY_CONFIG[item.category]?.icon || "📌"}</span>
                        <div>
                          <p className="text-xs font-semibold text-white">{item.item}</p>
                          <p className="text-[10px] text-[var(--text-muted)] font-medium">
                            {CATEGORY_CONFIG[item.category]?.label || item.category}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-white">{formatCurrency(item.amount)}</span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
