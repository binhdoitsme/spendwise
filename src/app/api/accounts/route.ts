import { provideAccountServices } from "@/modules/accounts/account.module";
import { AccountInput } from "@/modules/accounts/application/dto/dtos.types";
import { getCurrentUserId } from "@/modules/auth/presentation/api/current-user";
import { NextRequest } from "next/server";
import { created } from "../api-responses";
import { handleError } from "../error-handler";

// POST /api/accounts -- create new account
export async function POST(request: NextRequest) {
  const userId = (await getCurrentUserId(request.headers))!;
  const requestBody = (await request.json()) as AccountInput;
  const accountService = provideAccountServices();
  try {
    const { id } = await accountService.createAccount({
      ...requestBody,
      userId,
    });
    return created({ accountId: id });
  } catch (err) {
    return handleError(err);
  }
}

// GET /api/accounts -- get all accounts
export async function GET(request: NextRequest) {
  const userId = (await getCurrentUserId(request.headers))!;
  const accountService = provideAccountServices();
  try {
    const accounts = await accountService.getAccounts(userId);
    return created({ accounts });
  } catch (err) {
    return handleError(err);
  }
}
