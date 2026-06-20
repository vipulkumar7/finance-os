"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency, CATEGORY_CONFIG, getMonthName } from "@/lib/utils";
import { X } from "lucide-react";

interface DailyData {
  [date: string]: {
    total: number;
    items: { item: string; amount: number; category: string }[];
  };
}

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getColor(amount: number, max: number): string {
  if (amount === 0) return "rgba(255,255,255,0.03)";
  const intensity = Math.min(amount / max, 1);
  if (intensity < 0.25) return "rgba(16, 185, 129, 0.2)";
  if (intensity < 0.5) return "rgba(16, 185, 129, 0.4)";
  if (intensity < 0.75) return "rgba(16, 185, 129, 0.6)";
  return "rgba(16, 185, 129, 0.85)";
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

  // Generate calendar grid
  const weeks = useMemo(() => {
    const result: { date: string; day: number; month: number }[][] = [];
    let currentWeek: { date: string; day: number; month: number }[] = [];

    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);

    // Pad to start on Monday
    const startDay = start.getDay() || 7;
    for (let i = 1; i < startDay; i++) {
      currentWeek.push({ date: "", day: 0, month: 0 });
    }

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      currentWeek.push({
        date: dateStr,
        day: d.getDate(),
        month: d.getMonth(),
      });
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push({ date: "", day: 0, month: 0 });
      result.push(currentWeek);
    }

    return result;
  }, [year]);

  const selectedData = selected ? dailyData[selected] : null;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Spending Heatmap</h1>
        <p className="text-sm text-[var(--text-muted)]">{year} · GitHub-style spending calendar</p>
      </div>

      {/* Heatmap */}
      <div className="glass-card-static p-5 overflow-x-auto">
        {/* Day labels */}
        <div className="flex gap-[3px] mb-2 ml-8">
          {/* Month labels across top */}
        </div>

        <div className="flex gap-1">
          {/* Day of week labels */}
          <div className="flex flex-col gap-[3px] mr-2 pt-0">
            {DAYS.map((d, i) => (
              <div key={i} className="text-[10px] text-[var(--text-muted)] h-[13px] flex items-center">
                {i % 2 === 0 ? d : ""}
              </div>
            ))}
          </div>

          {/* Weeks */}
          <div className="flex gap-[3px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((cell, ci) => {
                  if (!cell.date) {
                    return <div key={ci} className="w-[13px] h-[13px]" />;
                  }
                  const data = dailyData[cell.date];
                  const amount = data?.total || 0;
                  const isFuture = new Date(cell.date) > new Date();

                  return (
                    <button
                      key={ci}
                      onClick={() => !isFuture && setSelected(cell.date)}
                      className="w-[13px] h-[13px] rounded-sm transition-all hover:ring-1 hover:ring-emerald-400/50"
                      style={{
                        background: isFuture ? "rgba(255,255,255,0.01)" : getColor(amount, maxSpend),
                      }}
                      title={`${cell.date}: ${formatCurrency(amount)}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-4">
          <span className="text-xs text-[var(--text-muted)]">Less</span>
          {[0, 0.25, 0.5, 0.75, 1].map((level) => (
            <div
              key={level}
              className="w-[13px] h-[13px] rounded-sm"
              style={{ background: getColor(level * maxSpend, maxSpend) }}
            />
          ))}
          <span className="text-xs text-[var(--text-muted)]">More</span>
        </div>
      </div>

      {/* Day Breakdown Modal */}
      <AnimatePresence>
        {selected && selectedData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="glass-card-static p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">{selected}</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Total: {formatCurrency(selectedData.total)}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-7 h-7 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-muted)] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {selectedData.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-[var(--border-primary)] last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{CATEGORY_CONFIG[item.category]?.icon}</span>
                    <span className="text-sm text-white">{item.item}</span>
                  </div>
                  <span className="text-sm font-medium text-white">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
