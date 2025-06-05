import { JournalSummaryQueryInput } from "@/modules/reports/application/dto/dtos.types";
import { provideReportServices } from "@/modules/reports/reports.module";
import { NextRequest } from "next/server";
import { ok } from "../../api-responses";

export async function POST(req: NextRequest) {
  const input = (await req.json()) as JournalSummaryQueryInput;
  const paymentReportsServices = provideReportServices();
  const monthlySummary = await paymentReportsServices.getMonthlySummary(input);
  return ok(monthlySummary);
}
