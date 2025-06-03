import { JournalId } from "@/modules/journals/domain/journal";
import { MoneyAmount } from "@/modules/shared/presentation/currencies";

export interface Month {
  year: number;
  month: number;
}

export interface MonthlyJournalReportSpecs {
  journalId: JournalId;
  month: Month;
}

export class MonthlyJournalSummary {
  constructor(
    readonly month: Month,
    readonly amountsByAccount: Map<string, MoneyAmount>,
    readonly amountsByTag: Map<string, MoneyAmount>
  ) {}

  get total() {
    return Array.from(this.amountsByAccount.values()).reduce(
      (current, next) => ({
        currency: current.currency,
        amount: current.amount + next.amount,
      })
    );
  }
}
