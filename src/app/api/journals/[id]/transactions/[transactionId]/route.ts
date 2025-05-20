import { noContent, unauthorized } from "@/app/api/api-responses";
import { handleError } from "@/app/api/error-handler";
import { getCurrentUserId } from "@/modules/auth/presentation/api/current-user";
import { provideJournalServices } from "@/modules/journals/journal.module";
import { NextRequest } from "next/server";

// PATCH /journals/{id}/transactions/{transactionId} -- update transaction
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; transactionId: string }> }
) {
  const journalService = provideJournalServices();
  const { transactionId } = await params;
  const userId = await getCurrentUserId(request.headers);
  if (!userId) {
    return unauthorized();
  }
  try {
    const body = (await request.json()) as Record<string, unknown>;
    await journalService.editTransaction(transactionId, body);
    return noContent();
  } catch (err) {
    return handleError(err);
  }
}

// DELETE /journals/{id}/transactions/{transactionId} -- remove transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; transactionId: string }> }
) {
  const journalService = provideJournalServices();
  const { id: journalId, transactionId } = await params;
  const userId = await getCurrentUserId(request.headers);
  if (!userId) {
    return unauthorized();
  }
  try {
    await journalService.deleteTransactions(userId, journalId, [transactionId]);
    return noContent();
  } catch (err) {
    return handleError(err);
  }
}
