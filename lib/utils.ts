import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format amount in Indian Rupee notation (₹1,58,000)
 */
export function formatCurrency(amount: number): string {
  if (amount === 0) return "₹0";

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  // Indian numbering system (lakhs, crores)
  const formatted = absAmount.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });

  return `${isNegative ? "-" : ""}₹${formatted}`;
}

/**
 * Format amount in compact form (₹1.5L, ₹2.3Cr)
 */
export function formatCompactCurrency(amount: number): string {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  if (absAmount >= 10000000) {
    return `${sign}₹${(absAmount / 10000000).toFixed(1)}Cr`;
  }
  if (absAmount >= 100000) {
    return `${sign}₹${(absAmount / 100000).toFixed(1)}L`;
  }
  if (absAmount >= 1000) {
    return `${sign}₹${(absAmount / 1000).toFixed(1)}K`;
  }
  return `${sign}₹${absAmount}`;
}

/**
 * Get percentage change between two values
 */
export function getPercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format date as short (14 Jun)
 */
export function formatDateShort(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

/**
 * Get month name from number (1-12)
 */
export function getMonthName(month: number): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return months[month - 1] || "";
}

/**
 * Get full month name
 */
export function getFullMonthName(month: number): string {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return months[month - 1] || "";
}

/**
 * Expense category display config
 */
export const CATEGORY_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  GROCERY_OFFLINE: { label: "Grocery (Offline)", color: "#10b981", icon: "🛒" },
  GROCERY_ONLINE: { label: "Grocery (Online)", color: "#34d399", icon: "📦" },
  MEAT: { label: "Meat", color: "#ef4444", icon: "🥩" },
  MEDICAL: { label: "Medical", color: "#f97316", icon: "💊" },
  SHOPPING: { label: "Shopping", color: "#8b5cf6", icon: "🛍️" },
  BILLS: { label: "Bills", color: "#06b6d4", icon: "📄" },
  TRAVEL: { label: "Travel", color: "#3b82f6", icon: "✈️" },
  EATING_OUT: { label: "Eating Out", color: "#f59e0b", icon: "🍽️" },
  SNACKS: { label: "Snacks", color: "#ec4899", icon: "🍿" },
  FRUITS: { label: "Fruits", color: "#84cc16", icon: "🍎" },
  VEGETABLES: { label: "Vegetables", color: "#22c55e", icon: "🥬" },
  SWEETS: { label: "Sweets", color: "#a855f7", icon: "🍬" },
  VEHICLE: { label: "Vehicle", color: "#64748b", icon: "🚗" },
  OTHERS: { label: "Others", color: "#78716c", icon: "📌" },
};

/**
 * Payment mode display config
 */
export const PAYMENT_MODE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  PAYZAPP: { label: "Payzapp Wallet", color: "#06b6d4", icon: "👛" },
  HDFC_UPI_CC: { label: "HDFC UPI CC", color: "#3b82f6", icon: "💳" },
  SBI_CC: { label: "SBI CC", color: "#059669", icon: "💳" },
  HDFC_CC: { label: "HDFC CC", color: "#ef4444", icon: "💳" },
  JIO: { label: "JIO", color: "#0a59f7", icon: "📱" },
  YES_BANK_CC: { label: "Yes Bank CC", color: "#f59e0b", icon: "💳" },
  AMAZON_GIFT_CARD: { label: "Amazon Gift Card", color: "#ff9900", icon: "🎁" },
  FLIPKART_GIFT_CARD: { label: "Flipkart Gift Card", color: "#2874f0", icon: "🎁" },
  PHONE_PAY_GIFT_CARD: { label: "Phone Pay Gift Card", color: "#673ab7", icon: "🎁" },
  OTHER_BANK: { label: "Other Bank", color: "#64748b", icon: "🏦" },
  CASH: { label: "Cash", color: "#22c55e", icon: "💵" },
  PLUXEE: { label: "Pluxee", color: "#ec4899", icon: "🍬" },
};

/**
 * Vehicle expense type config
 */
export const VEHICLE_TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  FUEL: { label: "Fuel", color: "#f59e0b", icon: "⛽" },
  SERVICE: { label: "Service", color: "#3b82f6", icon: "🔧" },
  INSURANCE: { label: "Insurance", color: "#10b981", icon: "🛡️" },
  PARKING: { label: "Parking", color: "#8b5cf6", icon: "🅿️" },
  WASHING: { label: "Washing", color: "#06b6d4", icon: "🚿" },
  REPAIRS: { label: "Repairs", color: "#ef4444", icon: "🔨" },
  ACCESSORIES: { label: "Accessories", color: "#ec4899", icon: "🎨" },
};

/**
 * Get greeting based on time of day
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
