import { JournalId } from "@/modules/journals/domain/journal";
import {
  MonthlyAccountReport,
  MonthlyAccountReportSpecs,
} from "@/modules/reports/domain/account-report";
import { AccountReportRepository } from "@/modules/reports/domain/repositories";
import { AccountId } from "@/modules/shared/domain/identifiers";
import { ISOCurrency } from "@/modules/shared/presentation/currencies";
import { and, inArray, SQL } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DateTime } from "luxon";
import * as schema from "../schemas";
import { monthlyAccountReports } from "../schemas";

export class DrizzleAccountReportRepository implements AccountReportRepository {
  constructor(private readonly dbInstance: NodePgDatabase<typeof schema>) {}

  async getMonthlyAccountReports(
    specs: MonthlyAccountReportSpecs
  ): Promise<MonthlyAccountReport[]> {
    const conditions = new Array<SQL<unknown>>();
    if (specs.accountIds) {
      conditions.push(
        inArray(
          monthlyAccountReports.accountId,
          specs.accountIds.map(({ value }) => value)
        )
      );
    }
    if (specs.accountTypes) {
      conditions.push(
        inArray(monthlyAccountReports.accountType, [
          ...new Set(specs.accountTypes),
        ])
      );
    }
    if (specs.months) {
      conditions.push(
        inArray(
          monthlyAccountReports.month,
          specs.months.map(
            ({ year, month }) => `${year}${month.toString().padStart(2, "0")}`
          )
        )
      );
    }
    const results = await this.dbInstance
      .select()
      .from(monthlyAccountReports)
      .where(and(...conditions));
    return results.map(
      (result) =>
        new MonthlyAccountReport(
          new AccountId(result.accountId),
          new JournalId(result.journalId),
          {
            amount: result.totalAmount,
            currency: result.currency as unknown as ISOCurrency,
          },
          DateTime.fromFormat(result.month, "yyyyMM", { zone: "utc" }),
          !!result.dueDate
            ? DateTime.fromJSDate(result.dueDate).setZone("utc", {
                keepLocalTime: true,
              })
            : undefined,
          result.limit
            ? {
                amount: result.limit,
                currency: result.currency as unknown as ISOCurrency,
              }
            : undefined
        )
    );
  }
}
