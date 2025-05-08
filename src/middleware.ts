import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import * as sessionApi from "./app/api/sessions/route";
import { appConfig } from "./config/appConfig";
import { getUserFromAccessToken } from "./modules/auth/application/contracts/user-tokens";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next({ request });
  }
  let cookieStore = await cookies();
  if (!pathname.startsWith("/api/sessions") && !pathname.startsWith("/auth")) {
    if (cookieStore.has("refreshToken") && !cookieStore.has("accessToken")) {
      // try refresh access token
      console.log("Try refresh access token at:", request.nextUrl.pathname);
      await sessionApi.PATCH(request);
      cookieStore = await cookies();
    }

    if (!cookieStore.has("accessToken")) {
      if (request.nextUrl.pathname.startsWith("/api")) {
        return new NextResponse(
          JSON.stringify({
            statusCode: 401,
            message: "User is not authorized",
            error: "Unauthorized",
            data: {},
          }),
          { status: 401 }
        );
      }
    } else {
      request.headers.set(
        appConfig.userIdHeader,
        JSON.stringify(
          await getUserFromAccessToken(cookieStore.get("accessToken")!.value)
        )
      );
    }
  }
  return NextResponse.next({ request });
}
