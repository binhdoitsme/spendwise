import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { unauthorized } from "./app/api/api-responses";
import { appConfig } from "./config/appConfig";
import { JwtTokenHandler } from "./modules/auth/infrastructure/external/jwt-token-handler";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next({ request });
  }
  let cookieStore = await cookies();
  if (
    pathname.startsWith("/api/sessions") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/registration")
  ) {
    return NextResponse.next({ request });
  }

  const tokenHandler = new JwtTokenHandler(
    process.env.JWT_SECRET_KEY!,
    process.env.JWT_EXPIRES_IN!
  );

  if (
    cookieStore.has("accessToken") &&
    !(await tokenHandler.getUserFromAccessToken(
      cookieStore.get("accessToken")!.value
    ))
  ) {
    cookieStore.delete("accessToken");
  }

  if (cookieStore.has("refreshToken") && !cookieStore.has("accessToken")) {
    // try refresh access token
    console.log("Try refresh access token at:", request.nextUrl.pathname);
    const refreshUrl = new URL("/api/sessions", request.nextUrl.origin);
    const refreshedCookies = await fetch(refreshUrl, {
      method: "PATCH",
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
    }).then((res) => res.headers.get("set-cookie"));
    if (refreshedCookies) {
      refreshedCookies.split(",").forEach((cookie) => {
        const [name, ...rest] = cookie.split("=");
        const value = rest.join("=").split(";")[0];
        cookieStore.set(name.trim(), value.trim());
      });
    }
    cookieStore = await cookies();
  }

  if (!cookieStore.has("accessToken")) {
    if (pathname.startsWith("/api")) {
      return unauthorized();
    } else {
      return NextResponse.redirect(
        new URL("/auth/sign-in", request.nextUrl.origin)
      );
    }
  } else {
    const userMeta = await tokenHandler.getUserFromAccessToken(
      cookieStore.get("accessToken")!.value
    );
    request.headers.set(appConfig.userIdHeader, JSON.stringify(userMeta));
  }
  return NextResponse.next({ request });
}
