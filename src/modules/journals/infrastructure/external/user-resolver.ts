import { Email } from "@/modules/shared/domain/value-objects";
import { UserRepository } from "@/modules/users/domain/repositories";
import {
  UserBasic,
  UserResolver,
} from "../../application/contracts/user-resolver";

export class DrizzleUserResolver implements UserResolver {
  constructor(private readonly userRepository: UserRepository) {}
  async resolveOne(email: Email): Promise<UserBasic | undefined> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return undefined;
    }
    return {
      email: user.email,
      firstName: user.profile?.firstName ?? "",
      lastName: user.profile?.lastName ?? "",
      avatar: user.profile?.avatar
        ? { url: user.profile.avatar.url.toString() }
        : undefined,
    };
  }

  async resolveMany(emails: Email[]): Promise<UserBasic[]> {
    return Promise.all(emails.map((email) => this.resolveOne(email))).then(
      (users) => users.filter((user) => !!user).map((user) => user as UserBasic)
    );
  }
}
