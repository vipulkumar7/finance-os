"use client";

import { motion } from "framer-motion";
import { Sparkles, TrendingUp, TrendingDown, Info, Lightbulb } from "lucide-react";

interface Insight {
  icon: string;
  text: string;
  type: "positive" | "negative" | "neutral";
}

interface Props {
  insights: Insight[];
  userName: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function InsightsClient({ insights, userName }: Props) {
  // Count counts of insights
  const positiveCount = insights.filter((i) => i.type === "positive").length;
  const negativeCount = insights.filter((i) => i.type === "negative").length;

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
          <span>AI Insights</span>
        </h1>
        <p className="text-xs text-[var(--text-muted)]">
          Smart automated analysis of your wealth and habits
        </p>
      </div>

      {/* AI Advisor Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-emerald-500/10 via-zinc-950/80 to-purple-500/10 p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">Financial Advisor Report</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Hello, {userName}. I have finished analyzing your financial inputs for this month. 
              {positiveCount > 0 || negativeCount > 0 ? (
                <span>
                  {" "}
                  You have <strong className="text-emerald-400">{positiveCount} positive milestones</strong> and{" "}
                  <strong className="text-rose-400">{negativeCount} areas requiring adjustment</strong>. Here is your actionable breakdown:
                </span>
              ) : (
                " Please continue logging your expenses and net worth snapshots to unlock advanced optimization recommendations."
              )}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Insights List */}
      {insights.length > 0 ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {insights.map((insight, i) => {
            const isPositive = insight.type === "positive";
            const isNegative = insight.type === "negative";

            let typeLabel = "Info";
            let typeColor = "text-blue-400 bg-blue-500/10 border-l-blue-500";
            if (isPositive) {
              typeLabel = "Achievement";
              typeColor = "text-emerald-400 bg-emerald-500/10 border-l-emerald-500";
            } else if (isNegative) {
              typeLabel = "Action Required";
              typeColor = "text-rose-400 bg-rose-500/10 border-l-rose-500";
            }

            return (
              <motion.div
                key={i}
                variants={item}
                className={`flex items-start gap-4 p-4 rounded-xl border border-zinc-900 bg-zinc-950/60 border-l-4 transition-all hover:bg-zinc-950 ${typeColor.split(" ")[2]}`}
              >
                {/* Emoji Icon Container */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${typeColor.split(" ")[1]}`}>
                  {insight.icon}
                </div>

                {/* Insight Description */}
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${typeColor.split(" ").slice(0,2).join(" ")}`}>
                      {typeLabel}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed pr-2">
                    {insight.text}
                  </p>
                </div>

                {/* Status Indicator Icon */}
                <div className="shrink-0 mt-0.5">
                  {isPositive && <TrendingDown className="w-4 h-4 text-emerald-400" />}
                  {isNegative && <TrendingUp className="w-4 h-4 text-rose-400" />}
                  {!isPositive && !isNegative && <Info className="w-4 h-4 text-blue-400" />}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <Lightbulb className="w-7 h-7 text-[var(--text-muted)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">No advisor insights ready yet</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Add your monthly expenses to generate personalized AI financial insights.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
