import { MoneyAmount } from "@/modules/shared/presentation/currencies";

export interface AccountSummaryQueryInput {
  journalId?: string;
  accountId?: string;
  accountTypes?: ("cash" | "debit" | "credit" | "loan")[];
  monthRange?: {
    start: string;
    end: string;
  };
}

export interface PaymentDue {
  account: { displayName: string; type: string };
  dueDate: string; // ISO format
  dueAmount: MoneyAmount;
}

export interface MonthlySpend {
  account: { displayName: string; type: string };
  month: string; // e.g., "2025-05" (YYYY-MM format)
  spentAmount: MoneyAmount;
  creditLimit?: MoneyAmount;
}

export interface AccountSummary {
  upcomingDues: PaymentDue[];
  monthlySpends: MonthlySpend[];
}
