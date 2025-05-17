import { UserId } from "@/modules/shared/domain/identifiers";
import { Email } from "@/modules/shared/domain/value-objects";

export interface JournalUserBasic {
  id: UserId;
  email: Email;
  firstName: string;
  lastName: string;
  avatar?: {
    url: string;
  };
}

export abstract class JournalUserResolver {
  abstract resolveOne(userId: UserId): Promise<JournalUserBasic | undefined>;
  abstract resolveMany(userIds: Set<UserId>): Promise<JournalUserBasic[]>;
}
