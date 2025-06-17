import { ok } from "@/app/api/api-responses";
import { RepaymentPayload } from "@/modules/journals/application/dto/dtos.types";
import { provideJournalServices } from "@/modules/journals/journal.module";
import { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const journalId = (await params).id;
  const body = { ...(await request.json()), journalId } as RepaymentPayload;
  const journalService = provideJournalServices();
  const result = await journalService.createRepayment(body);
  return ok(result);
}
