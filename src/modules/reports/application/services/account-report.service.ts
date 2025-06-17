import { JournalId } from "@/modules/journals/domain/journal";
import { AccountId } from "@/modules/shared/domain/identifiers";
import { DateTime, Interval } from "luxon";
import { reportErrors } from "../../domain/errors";
import {
  AccountReportRepository,
  JournalReportRepository,
} from "../../domain/repositories";
import { AccountBasic, AccountResolver } from "../contracts/account-resolver";
import { JournalResolver } from "../contracts/journal-resolver";
import {
  AccountSummaryDto,
  AccountSummaryQueryInput,
  JournalSummaryDto,
  JournalSummaryQueryInput,
  MonthlySpend,
  PaymentDue,
} from "../dto/dtos.types";

export class ReportServices {
  constructor(
    private readonly accountReportRepository: AccountReportRepository,
    private readonly journalReportRepository: JournalReportRepository,
    private readonly accountResolver: AccountResolver,
    private readonly journalResolver: JournalResolver
  ) {}

  async getMonthlyAccountSummary(
    specs: AccountSummaryQueryInput
  ): Promise<AccountSummaryDto> {
    const accountIds = specs.journalId
      ? await this.journalResolver
          .resolveOne(new JournalId(specs.journalId))
          .then((journal) => journal?.accountIds)
      : specs.accountId
      ? [new AccountId(specs.accountId)]
      : undefined;
    if (!accountIds) {
      throw reportErrors.accountIdNotProvided;
    }
    const period = specs.period
      ? Interval.fromDateTimes(
          DateTime.fromISO(specs.period.start, { zone: "utc" }),
          DateTime.fromISO(specs.period.end, { zone: "utc" })
        )
      : undefined;
    const monthlyReports =
      await this.accountReportRepository.getMonthlyAccountReports({
        accountIds,
        period,
        accountTypes: specs.accountTypes ?? ["credit", "loan", "debit", "cash"],
      });
    const accounts = await this.accountResolver
      .resolveMany(accountIds)
      .then((accounts) =>
        accounts.reduce(
          (current, next) => ({ ...current, [next.id.value]: next }),
          {} as Record<string, AccountBasic>
        )
      );
    const monthlySpends: MonthlySpend[] = monthlyReports.map((report) => ({
      account: {
        displayName: accounts[report.accountId.value].displayName,
        type: accounts[report.accountId.value].type,
      },
      month: report.period.start!.toFormat("yyyy-MM"),
      spentAmount: report.amount,
      creditLimit: report.limit,
    }));

    const upcomingDues: PaymentDue[] = monthlyReports
      .filter((report) => !!report.dueDate)
      .map((report) => ({
        account: {
          id: report.accountId.value,
          displayName: accounts[report.accountId.value].displayName,
          type: accounts[report.accountId.value].type,
        },
        statementPeriod: {
          start: report.period.start!.toISODate()!,
          end: report.period.end!.toISODate()!,
        },
        statementMonth: report.period.start!.toFormat("yyyyMM"),
        dueAmount: report.amount,
        dueDate: report.dueDate!.toISODate()!,
        isPaidOff: report.repaymentStatus,
      }));

    return {
      monthlySpends,
      upcomingDues,
    };
  }

  async getMonthlySummary(
    specs: JournalSummaryQueryInput
  ): Promise<JournalSummaryDto> {
    const journalId = new JournalId(specs.journalId);
    const month = DateTime.fromFormat(specs.month, "yyyyMM", { zone: "utc" });
    const summary = await this.journalReportRepository.getMonthlyJournalSummary(
      {
        month,
        journalId,
      }
    );
    const prevMonthSummary =
      await this.journalReportRepository.getMonthlyJournalSummary({
        month: month.minus({ months: 1 }),
        journalId,
      });
    const journal = (await this.journalResolver.resolveOne(journalId))!;
    const accounts = await this.accountResolver.resolveMany(journal.accountIds);
    return {
      accounts: accounts.map((account) => ({
        id: account.id.value,
        name: account.displayName,
        value: summary?.amountsByAccount?.get(account.id.value)?.amount ?? 0,
      })),
      currency: journal.currency,
      month: specs.month,
      spendingTags: Array.from(summary?.amountsByTag.entries() ?? []).map(
        ([tag, amount]) => ({ name: tag, amount: amount.amount })
      ),
      spentChange:
        (summary?.total?.amount ?? 0) - (prevMonthSummary?.total?.amount ?? 0),
      totalSpent: summary?.total?.amount ?? 0,
    };
  }
}
