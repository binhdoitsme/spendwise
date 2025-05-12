import { ok } from "@/app/api/api-responses";
import { ListingOptions } from "@/modules/journals/domain/repositories";
import { provideJournalServices } from "@/modules/journals/journal.module";
import { NextApiRequest } from "next";

// POST /journals/{id}/transactions/list -- list transactions of a journal
export async function POST(request: NextApiRequest) {
  const journalService = provideJournalServices();
  const { id: journalId } = request.query;
  const body = request.body as ListingOptions;
  const result = await journalService.getJournalById(journalId as string, body);
  return ok(result);
}
