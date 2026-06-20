import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import {
  formatCurrency,
  CATEGORY_CONFIG,
  PAYMENT_MODE_CONFIG,
  getPercentageChange,
} from "@/lib/utils";
import { Lightbulb, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Insight {
  icon: string;
  text: string;
  type: "positive" | "negative" | "neutral";
}

async function computeInsights(userId: string): Promise<Insight[]> {
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const [currentExpenses, lastExpenses, goals, latestNetWorth] = await Promise.all([
    prisma.expense.findMany({ where: { userId, date: { gte: currentMonthStart, lte: currentMonthEnd } } }),
    prisma.expense.findMany({ where: { userId, date: { gte: lastMonthStart, lte: lastMonthEnd } } }),
    prisma.goal.findMany({ where: { userId } }),
    prisma.netWorthSnapshot.findFirst({ where: { userId }, orderBy: [{ year: "desc" }, { month: "desc" }] }),
  ]);

  const insights: Insight[] = [];
  const totalCurrent = currentExpenses.reduce((s, e) => s + e.amount, 0);
  const totalLast = lastExpenses.reduce((s, e) => s + e.amount, 0);
  const daysInMonth = now.getDate();

  // Overall spending change
  if (totalLast > 0) {
    const change = getPercentageChange(totalCurrent, totalLast);
    if (change > 0) {
      insights.push({ icon: "📊", text: `You spent ${change}% more this month compared to last month (${formatCurrency(totalCurrent)} vs ${formatCurrency(totalLast)}).`, type: "negative" });
    } else if (change < 0) {
      insights.push({ icon: "📊", text: `Great! You spent ${Math.abs(change)}% less this month compared to last month.`, type: "positive" });
    }
  }

  // Category-level comparison
  const currentCats: Record<string, number> = {};
  const lastCats: Record<string, number> = {};
  currentExpenses.forEach((e) => { currentCats[e.category] = (currentCats[e.category] || 0) + e.amount; });
  lastExpenses.forEach((e) => { lastCats[e.category] = (lastCats[e.category] || 0) + e.amount; });

  Object.entries(currentCats).forEach(([cat, amount]) => {
    const lastAmount = lastCats[cat] || 0;
    if (lastAmount > 0) {
      const change = getPercentageChange(amount, lastAmount);
      const label = CATEGORY_CONFIG[cat]?.label || cat;
      if (change > 20) {
        insights.push({ icon: "🔥", text: `You spent ${change}% more on ${label} this month.`, type: "negative" });
      } else if (change < -20) {
        insights.push({ icon: "✅", text: `${label} expenses decreased by ${Math.abs(change)}%.`, type: "positive" });
      }
    }
  });

  // Daily average
  if (daysInMonth > 0 && totalCurrent > 0) {
    const daily = Math.round(totalCurrent / daysInMonth);
    insights.push({ icon: "💡", text: `Your average daily spending is ${formatCurrency(daily)}.`, type: "neutral" });
  }

  // Top payment mode
  const pmBreakdown: Record<string, number> = {};
  currentExpenses.forEach((e) => { pmBreakdown[e.paymentMode] = (pmBreakdown[e.paymentMode] || 0) + e.amount; });
  const topPM = Object.entries(pmBreakdown).sort((a, b) => b[1] - a[1])[0];
  if (topPM && totalCurrent > 0) {
    const pct = Math.round((topPM[1] / totalCurrent) * 100);
    insights.push({ icon: "💳", text: `You used ${PAYMENT_MODE_CONFIG[topPM[0]]?.label || topPM[0]} for ${pct}% of your spending.`, type: "neutral" });
  }

  // Goal progress
  goals.forEach((g) => {
    const progress = g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0;
    insights.push({ icon: "🎯", text: `${g.icon} ${g.name} progress is at ${progress}%.`, type: progress >= 50 ? "positive" : "neutral" });
  });

  // Net worth
  if (latestNetWorth) {
    insights.push({ icon: "💰", text: `Your current net worth is ${formatCurrency(latestNetWorth.netWorth)}.`, type: "neutral" });
  }

  return insights;
}

export default async function InsightsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const insights = await computeInsights(session.user.id);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">✨</span> AI Insights
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Smart analysis of your financial data
        </p>
      </div>

      {insights.length > 0 ? (
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <div
              key={i}
              className={`glass-card-static p-4 flex items-start gap-4 animate-fadeInUp`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                  insight.type === "positive"
                    ? "bg-emerald-500/10"
                    : insight.type === "negative"
                    ? "bg-red-500/10"
                    : "bg-blue-500/10"
                }`}
              >
                {insight.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {insight.text}
                </p>
              </div>
              {insight.type === "positive" && (
                <TrendingDown className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
              )}
              {insight.type === "negative" && (
                <TrendingUp className="w-4 h-4 text-red-400 shrink-0 mt-1" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center mb-4">
            <Lightbulb className="w-7 h-7 text-[var(--text-muted)]" />
          </div>
          <p className="text-sm text-[var(--text-muted)] mb-2">
            No insights available yet
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Add expenses to start getting insights
          </p>
        </div>
      )}
    </div>
  );
}
