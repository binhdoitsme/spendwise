import { ok } from "@/app/api/api-responses";
import { provideJournalAndReportServices } from "@/modules/aggregations/aggregations.module";
import { AggregatedJournalQueryInput } from "@/modules/aggregations/application/journal-reports.service";
import { provideJournalServices } from "@/modules/journals/journal.module";
import { provideReportServices } from "@/modules/reports/reports.module";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as AggregatedJournalQueryInput;

  const aggregatedService = provideJournalAndReportServices(
    provideJournalServices(),
    provideReportServices()
  );
  const result = await aggregatedService.getAggregatedJournal(body);
  return ok(result);
}
