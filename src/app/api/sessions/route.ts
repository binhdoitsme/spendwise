import { SessionCreate } from "@/modules/auth/application/dto/dtos.types";
import { provideAuthServices } from "@/modules/auth/auth.module";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const accessTokenCookieConfig = {
  maxAge: 30,
  httpOnly: true,
  secure: true,
};

const refreshTokenCookieConfig = {
  httpOnly: true,
  secure: true,
};

// POST /api/sessions -- create new session with access token and refresh token
export async function POST(request: NextRequest) {
  const authService = provideAuthServices();
  const body = (await request.json()) as SessionCreate;
  const tokens = await authService.createSession(body);
  if (!tokens) {
    return new Response(
      JSON.stringify({
        statusCode: 400,
        message: "Cannot sign in",
        error: "Bad Request",
        data: {},
      }),
      { status: 400 }
    );
  }
  const cookieStore = await cookies();

  cookieStore.set("accessToken", tokens.accessToken, accessTokenCookieConfig);
  cookieStore.set(
    "refreshToken",
    tokens.refreshToken,
    refreshTokenCookieConfig
  );
  return new Response(null, { status: 201 });
}

// PATCH /api/sessions -- regenerate new access token from refresh token
export async function PATCH(request: NextRequest) {
  if (!request.cookies.has("refreshToken")) {
    return new Response(
      JSON.stringify({
        statusCode: 400,
        message: "Cannot refresh token",
        error: "Bad Request",
        data: {},
      }),
      { status: 400 }
    );
  }
  const authService = provideAuthServices();
  const tokens = await authService.refreshSession(
    request.cookies.get("refreshToken")!.value
  );

  if (!tokens) {
    return new Response(
      JSON.stringify({
        statusCode: 400,
        message: "Cannot refresh token",
        error: "Bad Request",
        data: {},
      }),
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  cookieStore.set("accessToken", tokens.accessToken, accessTokenCookieConfig);
  cookieStore.set(
    "refreshToken",
    tokens.refreshToken,
    refreshTokenCookieConfig
  );
  return new Response(null, { status: 204 });
}

// DELETE /api/sessions -- remove session and log out
export async function DELETE(request: NextRequest) {
  if (!request.cookies.has("refreshToken")) {
    return new Response(null, { status: 204 });
  }
  const authService = provideAuthServices();
  await authService.clearSession(request.cookies.get("refreshToken")!.value);
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  return new Response(null, { status: 204 });
}
