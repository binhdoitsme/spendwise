import { ApplicationError } from "@/modules/shared/base/errors";
import { NextResponse } from "next/server";

export function handleError(err: unknown, message?: string) {
  if ((err as ApplicationError).code) {
    return NextResponse.json(
      {
        statusCode: 400,
        message,
        error: "Bad Request",
        data: err,
      },
      { status: 400 }
    );
  }
  console.error(err);
  return NextResponse.json(
    {
      statusCode: 500,
      error: "Internal Server Error",
      message: message ?? (err as Error).message,
      data: {},
    },
    { status: 500 }
  );
}
