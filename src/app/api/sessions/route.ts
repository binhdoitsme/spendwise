import { cookies } from "next/headers";
import { NextRequest } from "next/server";

// POST /api/sessions -- create new session with access token and refresh token
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.set("accessToken", "accessToken", {
    maxAge: 30,
    httpOnly: true,
    secure: true,
  });
  cookieStore.set("refreshToken", "refreshToken", {
    maxAge: 36000,
    httpOnly: true,
    secure: true,
  });
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
  const cookieStore = await cookies();
  cookieStore.set("accessToken", "accessToken", {
    maxAge: 30,
    httpOnly: true,
    secure: true,
  });
  return new Response(null, { status: 204 });
}

// DELETE /api/sessions -- remove session and log out
export async function DELETE(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  return new Response(null, { status: 204 });
}
