import { provideAccountServices } from "@/modules/accounts/account.module";
import { getCurrentUserId } from "@/modules/auth/presentation/api/current-user";
import { provideJournalServices } from "@/modules/journals/journal.module";
import { provideReportServices } from "@/modules/reports/reports.module";
import { DateTime } from "luxon";
import { headers } from "next/headers";
import { FinanceJournalPageContent } from "./content";

export default async function FinanceJournalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const service = provideJournalServices();
  const id = (await params).id;
  const journal = await service.getJournalById(id);
  const accountService = provideAccountServices();
  const headerStore = await headers();
  const userId = await getCurrentUserId(headerStore);
  const accounts = await accountService.getAccounts(userId!);
  const accountReportServices = provideReportServices();
  const now = DateTime.now();
  const recent2Months = {
    start: now.startOf("month").minus({ months: 1 }).toISODate(),
    end: now.endOf("month").toISODate(),
  };
  const accountSummary = await accountReportServices.getMonthlyAccountSummary({
    journalId: id,
    period: recent2Months,
    accountTypes: ["credit", "loan"],
  });
  const thisMonth = now.startOf("month");
  const journalSummary = await accountReportServices.getMonthlySummary({
    journalId: id,
    month: thisMonth.toFormat("yyyyMM"),
  });
  return (
    <FinanceJournalPageContent
      journal={journal}
      myAccounts={accounts}
      month={thisMonth.toFormat("yyyyMM")}
      accountSummary={accountSummary}
      journalSummary={journalSummary}
    />
  );
}
