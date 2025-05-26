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
  MonthlyCreditSpend,
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
    const thisMonth = DateTime.utc().startOf("month");
    const months = specs.monthRange
      ? Interval.fromDateTimes(
          DateTime.fromISO(specs.monthRange.start).startOf("month"),
          DateTime.fromISO(specs.monthRange.end).endOf("month")
        )
          .splitBy({ months: 1 })
          .map((interval) => ({
            year: interval.start!.year,
            month: interval.start!.month,
          }))
      : [{ year: thisMonth.year, month: thisMonth.month }];
    const monthlyReports =
      await this.accountReportRepository.getMonthlyAccountReports({
        accountIds,
        months,
        accountTypes: ["credit", "loan", "debit", "cash"],
      });
    const accounts = await this.accountResolver
      .resolveMany(accountIds)
      .then((accounts) =>
        accounts.reduce(
          (current, next) => ({ ...current, [next.id.value]: next }),
          {} as Record<string, AccountBasic>
        )
      );
    const monthlySpends: MonthlyCreditSpend[] = monthlyReports
      .filter((report) => accounts[report.accountId.value].type === "credit")
      .map((report) => ({
        account: {
          displayName: accounts[report.accountId.value].displayName,
        },
        month: report.month.toFormat("yyyy-MM"),
        spentAmount: report.amount,
        creditLimit: report.limit!,
      }));

    const upcomingDues: PaymentDue[] = monthlyReports
      .filter((report) => !!report.dueDate)
      .map((report) => ({
        account: {
          displayName: accounts[report.accountId.value].displayName,
        },
        dueAmount: report.amount,
        dueDate: report.dueDate!.toISODate()!,
      }));

    return {
      monthlySpends,
      upcomingDues,
      // monthlySpends: [
      //   // {
      //   //   account: { displayName: "BankA ****7890" },
      //   //   month: "2025-05",
      //   //   spentAmount: { amount: 8_000_000, currency: "VND" },
      //   //   creditLimit: { amount: 20_000_000, currency: "VND" },
      //   // },
      //   // {
      //   //   account: { displayName: "BankB ****7778" },
      //   //   month: "2025-05",
      //   //   spentAmount: { amount: 9_000_000, currency: "VND" },
      //   //   creditLimit: { amount: 15_000_000, currency: "VND" },
      //   // },
      //   {
      //     account: { displayName: "BankC ****1234" },
      //     month: "2025-05",
      //     spentAmount: { amount: 14_500_000, currency: "VND" },
      //     creditLimit: { amount: 15_000_000, currency: "VND" },
      //   },
      //   {
      //     account: { displayName: "BankD ****5678" },
      //     month: "2025-05",
      //     spentAmount: { amount: 2_000_000, currency: "VND" },
      //     creditLimit: { amount: 10_000_000, currency: "VND" },
      //   },
      // ],
      // upcomingDues: [
      //   // {
      //   //   account: { displayName: "BankA ****7890" },
      //   //   dueDate: "2025-06-04",
      //   //   dueAmount: { amount: 10_000_000, currency: "VND" },
      //   // },
      //   // {
      //   //   account: { displayName: "BankB ****7778" },
      //   //   dueDate: "2025-05-25",
      //   //   dueAmount: { amount: 8_500_000, currency: "VND" },
      //   // },
      //   {
      //     account: { displayName: "BankC ****1234" },
      //     dueDate: "2025-05-23",
      //     dueAmount: { amount: 5_000_000, currency: "VND" },
      //   },
      //   {
      //     account: { displayName: "BankD ****5678" },
      //     dueDate: "2025-06-30",
      //     dueAmount: { amount: 12_000_000, currency: "VND" },
      //   },
      // ],
    };
  }
}
