import { AccountSummaryQueryInput } from "@/modules/reports/application/dto/dtos.types";
import { provideReportServices } from "@/modules/reports/reports.module";
import { NextRequest } from "next/server";
import { ok } from "../../api-responses";

export async function POST(req: NextRequest) {
  const input = (await req.json()) as AccountSummaryQueryInput;
  const paymentReportsServices = provideReportServices();
  return ok(await paymentReportsServices.getMonthlyAccountSummary(input));
}
