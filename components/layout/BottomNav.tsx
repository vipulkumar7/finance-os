"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  BarChart3,
  User,
} from "lucide-react";
import { useState, useCallback, useEffect } from "react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Home", path: "/dashboard" },
  { icon: Receipt, label: "Expenses", path: "/expenses" },
  { icon: PiggyBank, label: "Net Worth", path: "/net-worth" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: User, label: "Profile", path: "/profile" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [loadingPath, setLoadingPath] = useState<string | null>(null);

  useEffect(() => {
    setLoadingPath(null);
  }, [pathname]);

  const handleNavigate = useCallback(
    (path: string) => {
      if (loadingPath) return;
      if (pathname === path) return;
      setLoadingPath(path);
      router.push(path);
    },
    [pathname, router, loadingPath]
  );

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50">
      <div className="bg-[var(--bg-secondary)]/95 backdrop-blur-xl border-t border-[var(--border-primary)]">
        <div className="flex justify-around items-center h-[var(--bottom-nav-height)] pb-[env(safe-area-inset-bottom)]">
          {NAV_ITEMS.map((item) => {
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
        </div>
      </div>
    </nav>
  );
}
