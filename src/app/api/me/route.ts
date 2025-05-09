import { getCurrentUserId } from "@/modules/auth/presentation/api/current-user";
import { provideUserServices } from "@/modules/users/users.module";

// GET /api/me -- get current user basic info
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
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
  const userService = provideUserServices();
  const user = await userService.getUserById(userId);
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
