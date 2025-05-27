import { provideAccountServices } from "@/modules/accounts/account.module";
import { NextRequest } from "next/server";
import { noContent } from "../../api-responses";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const accountId = (await params).id;
  // const headerStore = request.headers;
  // const userId = await getCurrentUserId(headerStore);
  const accountService = provideAccountServices();
  await accountService.deleteAccount(accountId);
  return noContent();
}
