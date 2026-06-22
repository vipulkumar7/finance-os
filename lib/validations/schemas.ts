import { z } from "zod";

export const expenseSchema = z.object({
  date: z.string().min(1, "Date is required"),
  item: z.string().min(1, "Item name is required").max(100),
  amount: z.number().positive("Amount must be positive"),
  category: z.enum([
    "GROCERY_OFFLINE",
    "GROCERY_ONLINE",
    "MEAT",
    "MEDICAL",
    "SHOPPING",
    "BILLS",
    "TRAVEL",
    "EATING_OUT",
    "SNACKS",
    "FRUITS",
    "VEGETABLES",
    "SWEETS",
    "VEHICLE",
    "OTHERS",
  ]),
  paymentMode: z.enum([
    "PAYZAPP",
    "HDFC_UPI_CC",
    "SBI_CC",
    "HDFC_CC",
    "JIO",
    "YES_BANK_CC",
    "AMAZON_GIFT_CARD",
    "FLIPKART_GIFT_CARD",
    "PHONE_PAY_GIFT_CARD",
    "OTHER_BANK",
    "CASH",
    "PLUXEE",
  ]),
  vehicleType: z.enum([
    "FUEL",
    "SERVICE",
    "INSURANCE",
    "PARKING",
    "WASHING",
    "REPAIRS",
    "ACCESSORIES",
  ]).optional(),
  notes: z.string().optional(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

export const investmentSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
  mutualFundInvestment: z.number().min(0).default(0),
  stockInvestment: z.number().min(0).default(0),
  fdInvestment: z.number().min(0).default(0),
  arbitrageInvestment: z.number().min(0).default(0),
  liquidFundInvestment: z.number().min(0).default(0),
  npsContribution: z.number().min(0).default(0),
  epfContribution: z.number().min(0).default(0),
  goldInvestment: z.number().min(0).default(0),
  notes: z.string().optional(),
});

export type InvestmentFormData = z.infer<typeof investmentSchema>;

export const netWorthSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
  mutualFundsValue: z.number().min(0).default(0),
  stocksValue: z.number().min(0).default(0),
  epfValue: z.number().min(0).default(0),
  npsValue: z.number().min(0).default(0),
  fdValue: z.number().min(0).default(0),
  liquidFundValue: z.number().min(0).default(0),
  arbitrageFundValue: z.number().min(0).default(0),
  savingsAccountValue: z.number().min(0).default(0),
  goldValue: z.number().min(0).default(0),
  cryptoValue: z.number().min(0).default(0),
  lentAmount: z.number().min(0).default(0),
  personalLoan: z.number().min(0).default(0),
  homeLoan: z.number().min(0).default(0),
  otherLoan: z.number().min(0).default(0),
});

export type NetWorthFormData = z.infer<typeof netWorthSchema>;

export const goalSchema = z.object({
  name: z.string().min(1, "Name is required"),
  targetAmount: z.number().positive("Target amount must be positive"),
  currentAmount: z.number().min(0).default(0),
  targetDate: z.string().min(1, "Target date is required"),
  icon: z.string().default("🎯"),
  description: z.string().optional(),
});

export type GoalFormData = z.infer<typeof goalSchema>;

export const vehicleExpenseSchema = z.object({
  date: z.string().min(1, "Date is required"),
  amount: z.number().positive("Amount must be positive"),
  type: z.enum([
    "FUEL",
    "SERVICE",
    "INSURANCE",
    "PARKING",
    "WASHING",
    "REPAIRS",
    "ACCESSORIES",
  ]),
  notes: z.string().optional(),
});

export type VehicleExpenseFormData = z.infer<typeof vehicleExpenseSchema>;
