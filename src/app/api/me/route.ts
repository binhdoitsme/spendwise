import { getCurrentUser } from "@/modules/auth/presentation/contracts/current-user";

// GET /api/me -- get current user basic info
export async function GET() {
  const user = await getCurrentUser();
  if (user) {
    return Response.json(user);
  } else {
    return new Response(
      JSON.stringify({
        statusCode: 401,
        message: "User is not authorized",
        error: "Unauthorized",
        data: {},
      }),
      { status: 401 }
    );
  }
}
