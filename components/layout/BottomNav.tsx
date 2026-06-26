"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  BarChart3,
  Menu,
  X,
  CalendarDays,
  TrendingUp,
  Target,
  Car,
  Lightbulb,
  Settings,
  Plus,
  Award,
} from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const BOTTOM_ITEMS = [
  { icon: LayoutDashboard, label: "Home", path: "/dashboard" },
  { icon: Receipt, label: "Expenses", path: "/expenses" },
  { icon: PiggyBank, label: "Net Worth", path: "/net-worth" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
];

const DRAWER_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Receipt, label: "Expenses", path: "/expenses" },
  { icon: PiggyBank, label: "Net Worth", path: "/net-worth" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: CalendarDays, label: "Calendar", path: "/calendar" },
  { icon: TrendingUp, label: "Budget", path: "/budget" },
  { icon: Target, label: "Goals", path: "/goals" },
  { icon: Car, label: "Vehicles", path: "/vehicle" },
  { icon: Lightbulb, label: "Insights", path: "/insights" },
  { icon: Award, label: "Rewards", path: "/rewards" },
  { icon: Settings, label: "Settings", path: "/profile" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [loadingPath, setLoadingPath] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setLoadingPath(null);
    setIsMenuOpen(false); // Auto-close drawer on route change
  }, [pathname]);

  const handleNavigate = useCallback(
    (path: string) => {
      if (loadingPath) return;
      if (pathname === path) {
        setIsMenuOpen(false);
        return;
      }
      setLoadingPath(path);
      router.push(path);
    },
    [pathname, router, loadingPath]
  );

  return (
    <>
      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50">
        <div className="bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-900/60 shadow-lg">
          <div className="flex justify-around items-center h-[var(--bottom-nav-height)] pb-[env(safe-area-inset-bottom)]">
            {BOTTOM_ITEMS.map((item) => {
              const isActive =
                pathname === item.path || pathname.startsWith(item.path + "/");
              const isLoading = loadingPath === item.path;
              const Icon = item.icon;

              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  disabled={isLoading}
                  className={`flex flex-col items-center gap-1 transition-all duration-200 ${
                    isLoading ? "opacity-50" : "active:scale-90"
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "text-emerald-400 bg-emerald-500/10"
                        : "text-[var(--text-muted)]"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-medium ${
                      isActive ? "text-emerald-400" : "text-[var(--text-muted)]"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}

            {/* More Menu Button */}
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="flex flex-col items-center gap-1 transition-all duration-200 active:scale-90"
            >
              <div
                className={`p-1.5 rounded-xl transition-all duration-200 ${
                  isMenuOpen
                    ? "text-emerald-400 bg-emerald-500/10"
                    : "text-[var(--text-muted)]"
                }`}
              >
                <Menu className="w-5 h-5" />
              </div>
              <span
                className={`text-[10px] font-medium ${
                  isMenuOpen ? "text-emerald-400" : "text-[var(--text-muted)]"
                }`}
              >
                More
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Slide-Up Navigation Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />

            {/* Bottom Sheet Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="md:hidden fixed bottom-0 left-0 w-full z-45 bg-zinc-950/98 border-t border-zinc-900 rounded-t-[28px] shadow-2xl pb-[calc(var(--bottom-nav-height)+20px)] max-h-[85vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-900/60 sticky top-0 bg-zinc-950/90 backdrop-blur-md z-10">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Explore Pages</h3>
                  <p className="text-[10px] text-[var(--text-muted)] font-medium">Quick link shortcut navigation</p>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Grid of Navigation Links */}
              <div className="grid grid-cols-3 gap-y-6 gap-x-3 p-6 text-center">
                {DRAWER_ITEMS.map((item) => {
                  const isActive =
                    pathname === item.path || pathname.startsWith(item.path + "/");
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className="flex flex-col items-center gap-2 group cursor-pointer"
                    >
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 ${
                          isActive
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                            : "bg-zinc-900 border-zinc-800 text-zinc-400 group-hover:text-white"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className={`text-[10px] font-bold tracking-tight transition-colors ${
                          isActive
                            ? "text-emerald-400"
                            : "text-zinc-400 group-hover:text-white"
                        }`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Add Expense Action Button */}
      {(pathname === "/dashboard" || pathname === "/" || pathname === "/expenses") && (
        <Link
          href="/expenses/add"
          className="md:hidden fixed bottom-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom)+16px)] right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-950/40 hover:scale-105 active:scale-95 transition-all duration-200 border border-emerald-300/10"
        >
          <Plus className="w-6 h-6" />
        </Link>
      )}
    </>
  );
}
