import { created, noContent } from "@/app/api/api-responses";
import { handleError } from "@/app/api/error-handler";
import { provideAccountServices } from "@/modules/accounts/account.module";
import { AccountInput } from "@/modules/accounts/application/dto/dtos.types";
import { getCurrentUserId } from "@/modules/auth/presentation/api/current-user";
import { provideJournalServices } from "@/modules/journals/journal.module";
import { NextRequest, NextResponse } from "next/server";

export type LinkJournalAccountRequest =
  | { account: AccountInput }
  | { accountId: string };

// POST /journals/{id}/accounts -- link account to account book
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const journalId = (await context.params).id;
  const requestBody = (await request.json()) as LinkJournalAccountRequest;
  const userId = (await getCurrentUserId(request.headers))!;
  const journalService = provideJournalServices();
  let accountId;
  try {
    if ("account" in requestBody) {
      // new account
      const accountService = provideAccountServices();
      const { id } = await accountService.createAccount({
        ...requestBody.account,
        userId,
      });
      accountId = id;
    } else if ("accountId" in requestBody) {
      // existing account
      accountId = requestBody.accountId;
    } else {
      return NextResponse.json(
        {
          statusCode: 400,
          message: "Bad Request",
          error: "Bad Request",
          data: {},
        },
        { status: 400 }
      );
    }
    await journalService.linkAccount({
      id: journalId,
      accountId,
      ownerId: userId,
    });
    return created();
  } catch (err) {
    return handleError(err);
  }
}

// DELETE /journals/{id}/accounts -- remove account from account book
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const journalId = (await context.params).id;
  const requestBody = (await request.json()) as { accountId: string };
  const journalService = provideJournalServices();
  try {
    journalService.unlinkAccount(journalId, requestBody.accountId);
    return noContent();
  } catch (err) {
    return handleError(err);
  }
}
