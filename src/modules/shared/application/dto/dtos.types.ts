import { MoneyAmount } from "@/modules/shared/presentation/currencies";

export interface SpendingCategoryDto {
  id: string; // UUID string
  journalId: string; // UUID string
  name: string;
  limit: MoneyAmount;
  monthlySpent: Record<string, MoneyAmount>; // Map of month to spent amount
  type: "daily" | "weekly" | "monthly" | "yearly";
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface SpentDto {
  month: string;
  spent: MoneyAmount;
}
