import { UserCreateDto } from "@/modules/users/application/dto/dtos.types";
import { provideUserServices } from "@/modules/users/users.module";
import { NextRequest } from "next/server";
import { created } from "../api-responses";
import { handleError } from "../error-handler";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as UserCreateDto;
  const userService = provideUserServices();
  try {
    const result = await userService.registerUser(body);
    return created(result);
  } catch (err) {
    return handleError(err, "Cannot register user");
  }
}
