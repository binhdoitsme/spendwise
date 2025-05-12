import { created } from "@/app/api/api-responses";
import { TransactionCreateDto } from "@/modules/journals/application/dto/dtos.types";
import { provideJournalServices } from "@/modules/journals/journal.module";
import { NextApiRequest } from "next";

// POST /journals/{id}/transactions -- create transaction
export async function POST(request: NextApiRequest) {
  const journalService = provideJournalServices();
  const { id: journalId } = request.query;
  const body = request.body as TransactionCreateDto;
  const transactionId = await journalService.createTransaction(
    journalId as string,
    body
  );
  return created({ transactionId });
}

// DELETE /journals/{id}/transactions -- remove transaction
export function DELETE() {}
