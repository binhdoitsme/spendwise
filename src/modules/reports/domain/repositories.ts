import { MonthlyAccountReport, MonthlyAccountReportSpecs } from "./account-report";

export abstract class AccountReportRepository {
  abstract getMonthlyAccountReports(
    specs: MonthlyAccountReportSpecs
  ): Promise<MonthlyAccountReport[]>;
}
