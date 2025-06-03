import { MoneyAmount } from "@/modules/shared/presentation/currencies";

export interface AccountSummaryQueryInput {
  journalId?: string;
  accountId?: string;
  accountTypes?: ("cash" | "debit" | "credit" | "loan")[];
  dimension?: "month" | "statement";
  period?: {
    start: string;
    end: string;
  };
}

export interface JournalSummaryQueryInput {
  journalId: string;
  month: string;
}

export interface PaymentDue {
  account: { displayName: string; type: string };
  statementPeriod: {
    start: string; // ISO format
    end: string; // ISO format
  };
  dueDate: string; // ISO format
  dueAmount: MoneyAmount;
}

export interface MonthlySpend {
  account: { displayName: string; type: string };
  month: string; // e.g., "2025-05" (YYYY-MM format)
  spentAmount: MoneyAmount;
  creditLimit?: MoneyAmount;
}

export interface AccountSummaryDto {
  upcomingDues: PaymentDue[];
  monthlySpends: MonthlySpend[];
}

export interface AccountSpentDto {
  id: string;
  name: string;
  value: number;
}

export interface JournalSummaryDto {
  month: string;
  totalSpent: number;
  spentChange: number;
  spendingTags: { name: string; amount: number }[];
  accounts: AccountSpentDto[];
  currency: string;
}
