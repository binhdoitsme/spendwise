import { JournalServices } from "@/modules/journals/application/services/journal.service";
import { ReportServices } from "@/modules/reports/application/services/account-report.service";
import { JournalAndReportServices } from "./application/journal-reports.service";

export function provideJournalAndReportServices(
  journalServices: JournalServices,
  reportServices: ReportServices
) {
  return new JournalAndReportServices(journalServices, reportServices);
}
