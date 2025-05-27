import { getCurrentUserId } from "@/modules/auth/presentation/api/current-user";
import { UserProfileDto } from "@/modules/users/application/dto/dtos.types";
import { provideUserServices } from "@/modules/users/users.module";
import { NextRequest } from "next/server";
import { ok, unauthorized } from "../api-responses";
import { handleError } from "../error-handler";

// GET /api/me -- get current user basic info
export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId(request.headers);
  if (!userId) {
    return unauthorized();
  }
  const userService = provideUserServices();
  const user = await userService.getUserById(userId);
  if (user) {
    return ok(user);
  } else {
    return unauthorized();
  }
}

// PATCH /api/me -- update current user profile
export async function PATCH(request: NextRequest) {
  const userId = await getCurrentUserId(request.headers);
  if (!userId) {
    return unauthorized();
  }
  const userService = provideUserServices();
  const body = (await request.json()) as UserProfileDto;
  try {
    await userService.updateUserProfile(userId, body);
    return ok({ userId });
  } catch (err) {
    return handleError(err);
  }
}
