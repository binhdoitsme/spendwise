import { ApplicationError } from "@/modules/shared/base/errors";
import { UserCreateDto } from "@/modules/users/application/dto/dtos.types";
import { provideUserServices } from "@/modules/users/users.module";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as UserCreateDto;
  const userService = provideUserServices();
  try {
    const result = await userService.registerUser(body);
    return new NextResponse(JSON.stringify(result), { status: 201 });
  } catch (err) {
    const typedErr = err as ApplicationError;
    return new NextResponse(
      JSON.stringify({
        statusCode: 400,
        message: "Cannot create user",
        error: "Bad Request",
        data: typedErr,
      }), 
      { status: 400 }
    );
  }
}
