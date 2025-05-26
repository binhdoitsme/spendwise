import { MoneyAmount } from "@/modules/shared/presentation/currencies";

export interface AccountSummaryQueryInput {
  journalId?: string;
  accountId?: string;
  monthRange?: {
    start: string;
    end: string;
  };
}

export interface PaymentDue {
  account: { displayName: string };
  dueDate: string; // ISO format
  dueAmount: MoneyAmount;
}

export interface MonthlyCreditSpend {
  account: { displayName: string };
  month: string; // e.g., "2025-05" (YYYY-MM format)
  spentAmount: MoneyAmount;
  creditLimit: MoneyAmount;
}

export interface AccountSummary {
  upcomingDues: PaymentDue[];
  monthlySpends: MonthlyCreditSpend[];
}
