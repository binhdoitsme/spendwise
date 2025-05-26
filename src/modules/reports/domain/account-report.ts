import { JournalId } from "@/modules/journals/domain/journal";
import { AccountId } from "@/modules/shared/domain/identifiers";
import { MoneyAmount } from "@/modules/shared/presentation/currencies";
import { DateTime } from "luxon";

export type Month = {
  year: number;
  month: number;
};

export interface MonthlyAccountReportSpecs {
  accountIds?: AccountId[];
  accountTypes?: ("credit" | "loan" | "debit" | "cash")[];
  months?: Month[];
}

export class MonthlyAccountReport {
  constructor(
    readonly accountId: AccountId,
    readonly journalId: JournalId,
    readonly amount: MoneyAmount,
    readonly month: DateTime,
    readonly dueDate?: DateTime,
    readonly limit?: MoneyAmount
  ) {}
}
