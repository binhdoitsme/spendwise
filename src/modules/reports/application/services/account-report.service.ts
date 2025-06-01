import { JournalId } from "@/modules/journals/domain/journal";
import { AccountId } from "@/modules/shared/domain/identifiers";
import { DateTime, Interval } from "luxon";
import { reportErrors } from "../../domain/errors";
import { AccountReportRepository } from "../../domain/repositories";
import { AccountBasic, AccountResolver } from "../contracts/account-resolver";
import { JournalResolver } from "../contracts/journal-resolver";
import {
  AccountSummary,
  AccountSummaryQueryInput,
  MonthlySpend,
  PaymentDue,
} from "../dto/dtos.types";

export class AccountReportsServices {
  constructor(
    private readonly accountReportRepository: AccountReportRepository,
    private readonly accountResolver: AccountResolver,
    private readonly journalResolver: JournalResolver
  ) {}

  async getMonthlyAccountSummary(
    specs: AccountSummaryQueryInput
  ): Promise<AccountSummary> {
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
    console.log({ specs, period });
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
          displayName: accounts[report.accountId.value].displayName,
          type: accounts[report.accountId.value].type,
        },
        statementPeriod: {
          start: report.period.start!.toISODate()!,
          end: report.period.end!.toISODate()!,
        },
        dueAmount: report.amount,
        dueDate: report.dueDate!.toISODate()!,
      }));

    return {
      monthlySpends,
      upcomingDues,
    };
  }
}
