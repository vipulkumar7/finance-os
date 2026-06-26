"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  CalendarDays,
  Wallet,
  CreditCard,
  Car,
  Lightbulb,
  Award,
  FileText,
  Settings,
  TrendingUp,
  Target,
  PiggyBank,
} from "lucide-react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Receipt, label: "Expenses", path: "/expenses" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: CalendarDays, label: "Calendar", path: "/calendar" },
  { icon: TrendingUp, label: "Budget", path: "/budget" },
  { icon: PiggyBank, label: "Net Worth", path: "/net-worth" },
  { icon: Target, label: "Goals", path: "/goals" },
  { icon: Car, label: "Vehicles", path: "/vehicle" },
  { icon: Lightbulb, label: "Insights", path: "/insights" },
  { icon: Award, label: "Rewards", path: "/rewards" },
  { icon: Settings, label: "Settings", path: "/profile" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-[240px] h-screen bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] fixed left-0 top-0 z-40">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-3 px-5 h-[var(--header-height)] border-b border-[var(--border-primary)] hover:opacity-90 transition-opacity">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <Wallet className="w-4 h-4 text-white" />
        </div>
        <span className="text-base font-bold text-white tracking-tight">
          FinanceOS
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.path || pathname.startsWith(item.path + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`sidebar-item ${isActive ? "sidebar-item-active" : ""}`}
            >
              <Icon className="w-[18px] h-[18px]" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-[var(--border-primary)]">
        <div className="glass-card-static p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">👋</span>
            <span className="text-xs font-semibold text-white">
              Finance OS
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mb-3">
            Track your finances, grow your wealth.
          </p>
        </div>
      </div>
    </aside>
  );
}
