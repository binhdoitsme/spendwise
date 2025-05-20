import { created } from "@/app/api/api-responses";
import { TransactionCreateDto } from "@/modules/journals/application/dto/dtos.types";
import { provideJournalServices } from "@/modules/journals/journal.module";
import { NextRequest } from "next/server";

// POST /journals/{id}/transactions -- create transaction
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const journalService = provideJournalServices();
  const journalId = (await params).id;
  const body = (await request.json()) as TransactionCreateDto;
  const transactionId = await journalService.createTransaction(
    journalId as string,
    body
  );
  return created({ transactionId });
}
