import { appConfig } from "@/config/appConfig";
import { UserPayload } from "@/modules/auth/application/dto/dtos.types";
import { provideJournalServices } from "@/modules/journals/journal.module";
import { JournalFormSchema } from "@/modules/journals/presentation/components/forms";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { created } from "../api-responses";
import { handleError } from "../error-handler";

// POST /api/journals -- create new journal
export async function POST(request: NextRequest) {
  const requestBody = (await request.json()) as JournalFormSchema;
  const currentUserHeader = await headers().then(
    (headerStore) => headerStore.get(appConfig.userIdHeader)!
  );
  const currentUser = JSON.parse(currentUserHeader) as UserPayload;
  const journalService = provideJournalServices();
  try {
    const result = await journalService.createJournal({
      title: requestBody.title,
      currency: requestBody.currency,
      ownerId: currentUser.userId,
      ownerEmail: currentUser.email,
    });
    return created(result);
  } catch (err) {
    return handleError(err, "Cannot create journal");
  }
}
