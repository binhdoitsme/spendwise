import { ok } from "@/app/api/api-responses";
import { JournalTransactionSpecsInput } from "@/modules/journals/application/services/journal.service";
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
  const body = (await request.json()) as {
    specs: JournalTransactionSpecsInput;
    options: ListingOptions;
  };
  const result = await journalService.getTransactionsByJournalId(
    journalId as string,
    body.specs,
    body.options
  );
  return ok({ result });
}
