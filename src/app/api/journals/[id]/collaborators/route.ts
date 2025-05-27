import { created, noContent } from "@/app/api/api-responses";
import { handleError } from "@/app/api/error-handler";
import { getCurrentUserId } from "@/modules/auth/presentation/api/current-user";
import { provideJournalServices } from "@/modules/journals/journal.module";
import { NextRequest } from "next/server";

// GET /journals/{id}/collaborators -- get all collaborators of this account book
export function GET() {}

// POST /journals/{id}/collaborators -- invite collaborators to account book
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const journalId = (await context.params).id;
  const requestBody = (await request.json()) as {
    email: string;
    permission: string;
  };
  const userId = (await getCurrentUserId(request.headers))!;
  const journalService = provideJournalServices();
  try {
    await journalService.inviteCollaborator({
      journalId,
      userId,
      email: requestBody.email,
      permission: requestBody.permission,
    });
    return created();
  } catch (err) {
    return handleError(err);
  }
}

// DELETE /journals/{id}/collaborators -- remove collaborators from journal
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: journalId } = await context.params;
  const { userId } = (await request.json()) as {
    userId: string;
  };
  const journalService = provideJournalServices();
  try {
    await journalService.removeCollaborator(journalId, userId);
    return noContent();
  } catch (err) {
    return handleError(err);
  }
}
