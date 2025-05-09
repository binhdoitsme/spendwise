import { appConfig } from "@/config/appConfig";
import { headers } from "next/headers";
import { UserPayload } from "../../application/dto/dtos.types";

export async function getCurrentUserId() {
  const headerStore = await headers();
  if (!headerStore.has(appConfig.userIdHeader)) {
    return undefined;
  } else {
    const { userId } = JSON.parse(
      headerStore.get(appConfig.userIdHeader)!
    ) as UserPayload;
    return userId;
  }
}
