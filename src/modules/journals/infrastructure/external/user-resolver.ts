import { UserId } from "@/modules/shared/domain/identifiers";
import { UserRepository } from "@/modules/users/domain/repositories";
import {
  JournalUserBasic,
  JournalUserResolver,
} from "../../application/contracts/user-resolver";

export class DrizzleJournalUserResolver implements JournalUserResolver {
  constructor(private readonly userRepository: UserRepository) {}
  async resolveOne(userId: UserId): Promise<JournalUserBasic | undefined> {
    const user = await this.userRepository.findById(userId);
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

  async resolveMany(userIds: Set<UserId>): Promise<JournalUserBasic[]> {
    return Promise.all(
      Array.from(userIds).map((userId) => this.resolveOne(userId))
    ).then((users) =>
      users.filter((user) => !!user).map((user) => user as JournalUserBasic)
    );
  }
}
