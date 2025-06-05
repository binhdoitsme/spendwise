import { provideJournalServices } from "@/modules/journals/journal.module";
import { ok } from "../../api-responses";

// GET /journals/{id} -- get journal details by ID
export async function GET({ params }: { params: Promise<{ id: string }> }) {
  const journalId = (await params).id;
  const journalService = provideJournalServices();
  const journal = await journalService.getJournalById(journalId);
  return ok(journal);
}

// PUT /journals/{id} -- update journal settings
export function PUT() {}

// DELETE /journals/{id} -- delete journal
export function DELETE() {}
