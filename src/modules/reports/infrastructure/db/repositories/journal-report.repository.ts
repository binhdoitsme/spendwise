import {
  MonthlyJournalReportSpecs,
  MonthlyJournalSummary,
} from "@/modules/reports/domain/journal-report";
import { JournalReportRepository } from "@/modules/reports/domain/repositories";
import {
  ISOCurrency,
  MoneyAmount,
} from "@/modules/shared/presentation/currencies";
import { and, between, eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DateTime } from "luxon";
import * as schema from "../schemas";
import {
  monthlyJournalAccountReport,
  monthlyJournalTagReport,
} from "../schemas";

export class DrizzleJournalReportRepository implements JournalReportRepository {
  constructor(private readonly dbInstance: NodePgDatabase<typeof schema>) {}

  async getMonthlyJournalSummary(
    specs: MonthlyJournalReportSpecs
  ): Promise<MonthlyJournalSummary | undefined> {
    const { journalId, month } = specs;
    const monthStart = DateTime.fromObject(
      {
        year: month.year,
        month: month.month,
        day: 1,
      },
      { zone: "utc" }
    );
    const periodStart = monthStart.toJSDate();
    const periodEnd = monthStart.plus({ months: 1 }).toJSDate();
    const journalAccountReports = await this.dbInstance
      .select()
      .from(monthlyJournalAccountReport)
      .where(
        and(
          eq(monthlyJournalAccountReport.journalId, journalId.value),
          between(monthlyJournalAccountReport.month, periodStart, periodEnd)
        )
      );
    const journalTagReports = await this.dbInstance
      .select()
      .from(monthlyJournalTagReport)
      .where(
        and(
          eq(monthlyJournalTagReport.journalId, journalId.value),
          between(monthlyJournalTagReport.month, periodStart, periodEnd)
        )
      );
    const amountsByAccount = journalAccountReports.reduce((current, next) => {
      current.set(next.account, {
        amount: next.totalAmount,
        currency: next.currency as unknown as ISOCurrency,
      });
      return current;
    }, new Map<string, MoneyAmount>());
    const amountsByTag = journalTagReports.reduce((current, next) => {
      current.set(next.tag, {
        amount: next.totalAmount,
        currency: next.currency as unknown as ISOCurrency,
      });
      return current;
    }, new Map<string, MoneyAmount>());

    if (
      !amountsByAccount ||
      !amountsByAccount.size ||
      !amountsByTag ||
      !amountsByTag.size
    ) {
      return undefined;
    }

    return new MonthlyJournalSummary(month, amountsByAccount, amountsByTag);
  }
}
