import { Email } from "@/modules/shared/domain/value-objects";

export interface UserBasic {
  email: Email;
  fullName: string;
  avatar?: {
    url: string;
  };
}

export abstract class UserResolver {
  abstract resolveOne(email: Email): Promise<UserBasic | undefined>;
  abstract resolveMany(emails: Email[]): Promise<UserBasic[]>;
}
