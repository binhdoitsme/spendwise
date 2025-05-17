import { UserId } from "@/modules/shared/domain/identifiers";
import { Email } from "@/modules/shared/domain/value-objects";

export interface AccountUserBasic {
  id: UserId;
  email: Email;
  firstName: string;
  lastName: string;
  avatar?: {
    url: string;
  };
}

export abstract class AccountUserResolver {
  abstract resolveOne(id: UserId): Promise<AccountUserBasic | undefined>;
}
