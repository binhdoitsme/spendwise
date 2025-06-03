import { JournalSummaryQueryInput } from "@/modules/reports/application/dto/dtos.types";
import { provideAccountReportServices } from "@/modules/reports/reports.module";
import { NextRequest } from "next/server";
import { ok } from "../../api-responses";

export async function POST(req: NextRequest) {
  const input = (await req.json()) as JournalSummaryQueryInput;
  const paymentReportsServices = provideAccountReportServices();
  const monthlySummary = await paymentReportsServices.getMonthlySummary(input);
  return ok(monthlySummary);
}
