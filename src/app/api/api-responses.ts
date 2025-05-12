import { NextResponse } from "next/server";

export interface ResponseWithData<T> {
  data: T;
  statusCode: number;
}

export interface FailureResponse {
  statusCode: number;
  message: string;
  error: string;
}

export function created<T>(data?: T) {
  return NextResponse.json(data ? { statusCode: 201, data } : null, {
    status: 201,
  });
}

export function ok<T>(data?: T) {
  return NextResponse.json(data ? { statusCode: 200, data } : null, {
    status: 200,
  });
}

export function noContent() {
  return NextResponse.json(null, { status: 204 });
}

export function unauthorized() {
  return NextResponse.json(
    {
      statusCode: 401,
      message: "User is not authorized",
      error: "Unauthorized",
      data: {},
    },
    { status: 401 }
  );
}
