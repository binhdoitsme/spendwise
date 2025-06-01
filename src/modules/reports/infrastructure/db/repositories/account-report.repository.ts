import {
  MonthlyAccountReport,
  MonthlyAccountReportSpecs,
} from "@/modules/reports/domain/account-report";
import { AccountReportRepository } from "@/modules/reports/domain/repositories";
import { and, asc, desc } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { mapToMonthlyAccountReport } from "../mappers";
import * as schema from "../schemas";
import { monthlyAccountReports } from "../schemas";

export class DrizzleAccountReportRepository implements AccountReportRepository {
  constructor(private readonly dbInstance: NodePgDatabase<typeof schema>) {}

  async getMonthlyAccountReports(
    specs: MonthlyAccountReportSpecs
  ): Promise<MonthlyAccountReport[]> {
    const conditions = schema.mapToMonthlyAccountReportSQLConditions(specs);
    const results = await this.dbInstance
      .select()
      .from(monthlyAccountReports)
      .where(and(...conditions))
      .orderBy(
        desc(monthlyAccountReports.statementStartDate),
        asc(monthlyAccountReports.dueDate)
      );
    return results.map(mapToMonthlyAccountReport);
  }
}
