import { appConfig } from "@/config/appConfig";
import { UserId } from "@/modules/shared/domain/identifiers";
import { headers } from "next/headers";
import { UserMeta } from "../../application/contracts/user-tokens";
import { getUserBasic } from "../../application/queries/getUser.query";

export async function getCurrentUser() {
  const headerStore = await headers();
  if (!headerStore.has(appConfig.userIdHeader)) {
    return undefined;
  } else {
    const { userId } = JSON.parse(
      headerStore.get(appConfig.userIdHeader)!
    ) as UserMeta;
    return await getUserBasic(new UserId(userId));
  }
}
