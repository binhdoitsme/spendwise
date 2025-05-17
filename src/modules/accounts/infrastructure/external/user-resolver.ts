import { UserId } from "@/modules/shared/domain/identifiers";
import { UserRepository } from "@/modules/users/domain/repositories";
import {
  AccountUserBasic,
  AccountUserResolver,
} from "../../application/contracts/user-resolver";

export class DrizzleAccountUserResolver implements AccountUserResolver {
  constructor(private readonly userRepository: UserRepository) {}

  async resolveOne(id: UserId): Promise<AccountUserBasic | undefined> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      return undefined;
    }
    return {
      id: user.id,
      email: user.email,
      firstName: user.profile?.firstName ?? "",
      lastName: user.profile?.lastName ?? "",
      avatar: user.profile?.avatar
        ? { url: user.profile.avatar.url.toString() }
        : undefined,
    };
  }
}
