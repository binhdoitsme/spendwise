import { created } from "@/app/api/api-responses";
import { handleError } from "@/app/api/error-handler";
import { provideJournalServices } from "@/modules/journals/journal.module";
import { NextRequest } from "next/server";

// POST /api/journals/[id]/tags -- Create new tag(s) for a journal
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const journalId = (await params).id;
  const body = (await request.json()) as { tags: string[] };
  const { tags } = body;
  const journalService = provideJournalServices();
  try {
    await journalService.addTags(journalId, tags);
    return created({ tags });
  } catch (err) {
    return handleError(err);
  }
}
