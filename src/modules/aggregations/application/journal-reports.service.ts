import { JournalDetailedDto } from "@/modules/journals/application/dto/dtos.types";
import { JournalServices } from "@/modules/journals/application/services/journal.service";
import {
  AccountSummaryDto,
  JournalSummaryDto,
} from "@/modules/reports/application/dto/dtos.types";
import { ReportServices } from "@/modules/reports/application/services/account-report.service";
import { DateTime } from "luxon";

export interface AggregatedJournalQueryInput {
  journalId: string;
  month: string;
  today: string;
  query?: string;
  creditOnly?: boolean;
}

export interface AggregatedJournalResult {
  journal: JournalDetailedDto;
  accountSummary: AccountSummaryDto;
  journalSummary: JournalSummaryDto;
}

export class JournalAndReportServices {
  constructor(
    readonly journalServices: JournalServices,
    readonly reportServices: ReportServices
  ) {}

  async getAggregatedJournal(
    query: AggregatedJournalQueryInput
  ): Promise<AggregatedJournalResult> {
    const monthStart = DateTime.fromFormat(query.month, "yyyyMM", {
      zone: "utc",
    });
    const fullMonthDateRange = {
      start: monthStart.toISODate()!,
      end: monthStart.plus({ months: 1 }).toISODate()!,
    };
    const today = DateTime.fromISO(query.today, { zone: "utc" });
    const recent2Months = {
      start: today.startOf("month").minus({ months: 1 }).toISODate()!,
      end: today.startOf("month").plus({ months: 1 }).toISODate()!,
    };

    const [journal, transactions, accountSummary, journalSummary] =
      await Promise.all([
        this.journalServices.getJournalById(query.journalId),
        this.journalServices.getTransactionsByJournalId(query.journalId, {
          creditOnly: query.creditOnly,
          dateRange: fullMonthDateRange,
          query: query.query,
        }),
        this.reportServices.getMonthlyAccountSummary({
          journalId: query.journalId,
          period: recent2Months,
          accountTypes: ["credit", "loan"],
        }),
        this.reportServices.getMonthlySummary({
          journalId: query.journalId,
          month: query.month,
        }),
      ]);

    return {
      journal: { ...journal, transactions },
      accountSummary,
      journalSummary,
    };
  }
}
