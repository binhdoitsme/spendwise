import { ok } from "@/app/api/api-responses";
import { provideJournalServices } from "@/modules/journals/journal.module";
import { ListingOptions } from "@/modules/shared/domain/specs";
import { NextRequest } from "next/server";

// POST /journals/{id}/transactions/list -- list transactions of a journal
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const journalService = provideJournalServices();
  const journalId = (await params).id;
  const body = request.body as ListingOptions;
  const result = await journalService.getJournalById(journalId as string, body);
  return ok(result);
}
