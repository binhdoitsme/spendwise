import { appConfig } from "@/config/appConfig";
import { UserPayload } from "../../application/dto/dtos.types";

export async function getCurrentUserId(headerStore: Headers) {
  if (!headerStore.has(appConfig.userIdHeader)) {
    return undefined;
  } else {
    const { userId } = JSON.parse(
      headerStore.get(appConfig.userIdHeader)!
    ) as UserPayload;
    return userId;
  }
}
