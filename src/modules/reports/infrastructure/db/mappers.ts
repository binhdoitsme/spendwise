import { JournalId } from "@/modules/journals/domain/journal";
import { MonthlyAccountReport } from "@/modules/reports/domain/account-report";
import { AccountId } from "@/modules/shared/domain/identifiers";
import { ISOCurrency } from "@/modules/shared/presentation/currencies";
import { DateTime, Interval } from "luxon";
import { monthlyAccountReports } from "./schemas";

export const mapToMonthlyAccountReport = (
  result: typeof monthlyAccountReports.$inferSelect
) =>
  new MonthlyAccountReport(
    new AccountId(result.accountId),
    new JournalId(result.journalId),
    {
      amount: result.totalAmount,
      currency: result.currency as unknown as ISOCurrency,
    },
    Interval.fromDateTimes(
      DateTime.fromJSDate(result.statementStartDate, { zone: "utc" }),
      DateTime.fromJSDate(result.statementEndDate, { zone: "utc" })
    ),
    result.repaymentStatus,
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
  );
