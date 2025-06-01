import { JournalId } from "@/modules/journals/domain/journal";
import { AccountId } from "@/modules/shared/domain/identifiers";
import { MoneyAmount } from "@/modules/shared/presentation/currencies";
import { DateTime, Interval } from "luxon";

export interface Month {
  year: number;
  month: number;
}

export interface MonthlyAccountReportSpecs {
  accountIds?: AccountId[];
  accountTypes?: ("credit" | "loan" | "debit" | "cash")[];
  period?: Interval;
  orientation?: "calendar" | "statement";
}

export class MonthlyAccountReport {
  constructor(
    readonly accountId: AccountId,
    readonly journalId: JournalId,
    readonly amount: MoneyAmount,
    readonly period: Interval,
    readonly dueDate?: DateTime,
    readonly limit?: MoneyAmount
  ) {}
}
