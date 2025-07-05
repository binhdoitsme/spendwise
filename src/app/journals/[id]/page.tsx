import { provideJournalServices } from "@/modules/journals/journal.module";
import { provideReportServices } from "@/modules/reports/reports.module";
import { DateTime } from "luxon";
import { FinanceJournalPageContent } from "./content";

export default async function FinanceJournalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const journalServices = provideJournalServices();
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
  const { etag } = await journalServices.getJournalMeta(id);
  return (
    <FinanceJournalPageContent
      etag={etag}
      id={id}
      accountSummary={accountSummary}
    />
  );
}
