import ExpenseFormClient from "@/features/expenses/components/ExpenseFormClient";
import { Suspense } from "react";

export default function AddExpensePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-[var(--text-muted)] text-sm">Loading...</div>
      }
    >
      <ExpenseFormClient />
    </Suspense>
  );
}
