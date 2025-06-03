import {
  MonthlyAccountReport,
  MonthlyAccountReportSpecs,
} from "./account-report";
import {
  MonthlyJournalReportSpecs,
  MonthlyJournalSummary,
} from "./journal-report";

export abstract class AccountReportRepository {
  abstract getMonthlyAccountReports(
    specs: MonthlyAccountReportSpecs
  ): Promise<MonthlyAccountReport[]>;
}

export abstract class JournalReportRepository {
  abstract getMonthlyJournalSummary(
    specs: MonthlyJournalReportSpecs
  ): Promise<MonthlyJournalSummary | undefined>;
}
