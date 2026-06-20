"use client";

import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { LogOut, User, Mail, Shield } from "lucide-react";
import Image from "next/image";

export default function ProfileClient({
  user,
}: {
  user: { name: string; email: string; image: string };
}) {
  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-white">Profile</h1>

      {/* User Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-static p-6"
      >
        <div className="flex items-center gap-4 mb-6">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name}
              width={64}
              height={64}
              className="rounded-2xl"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-2xl font-bold text-white">
              {user.name?.charAt(0) || "U"}
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold text-white">{user.name}</h2>
            <p className="text-sm text-[var(--text-muted)]">{user.email}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 py-3 border-b border-[var(--border-primary)]">
            <User className="w-4 h-4 text-[var(--text-muted)]" />
            <div>
              <p className="text-xs text-[var(--text-muted)]">Name</p>
              <p className="text-sm text-white">{user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-3 border-b border-[var(--border-primary)]">
            <Mail className="w-4 h-4 text-[var(--text-muted)]" />
            <div>
              <p className="text-xs text-[var(--text-muted)]">Email</p>
              <p className="text-sm text-white">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-3">
            <Shield className="w-4 h-4 text-[var(--text-muted)]" />
            <div>
              <p className="text-xs text-[var(--text-muted)]">Account Type</p>
              <p className="text-sm text-white">Personal (Single User)</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* App Info */}
      <div className="glass-card-static p-6">
        <h3 className="text-sm font-semibold text-white mb-3">About</h3>
        <div className="space-y-2 text-xs text-[var(--text-muted)]">
          <p>FinanceOS v0.1.0</p>
          <p>Personal finance tracking dashboard</p>
          <p>Built with Next.js, Prisma, and PostgreSQL</p>
        </div>
      </div>

      {/* Sign Out */}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium text-sm hover:bg-red-500/20 transition-all"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  );
}
