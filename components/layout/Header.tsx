"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getGreeting } from "@/lib/utils";
import { useState, useEffect } from "react";
import SearchModal from "@/features/search/components/SearchModal";

interface HeaderProps {
  user?: {
    name?: string | null;
    image?: string | null;
  };
}

export default function Header({ user }: HeaderProps) {
  const firstName = user?.name?.split(" ")[0] || "there";
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Monitor Command/Control + K to open search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="h-[var(--header-height)] flex items-center justify-between px-4 md:px-8 border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/80 backdrop-blur-xl sticky top-0 z-30">
        {/* Left: Greeting */}
        <div>
          <h1 className="text-lg md:text-xl font-bold text-white">
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-xs text-[var(--text-muted)] hidden sm:block">
            Here&apos;s what&apos;s happening with your money today.
          </p>
        </div>

        {/* Right: Search + Avatar */}
        <div className="flex items-center gap-3">
          {/* Date range badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-primary)] text-xs text-[var(--text-secondary)]">
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>

          {/* Search */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-9 h-9 rounded-xl bg-[var(--bg-card)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-muted)] hover:text-white hover:border-[var(--border-hover)] transition-all"
            title="Search (Ctrl+K)"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Avatar Link */}
          <Link href="/profile" className="hover:opacity-90 transition-opacity">
            {user?.image ? (
              <Image
                src={user.image}
                alt="Profile"
                width={36}
                height={36}
                className="rounded-full border-2 border-[var(--border-primary)]"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold">
                {firstName.charAt(0)}
              </div>
            )}
          </Link>
        </div>
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}

