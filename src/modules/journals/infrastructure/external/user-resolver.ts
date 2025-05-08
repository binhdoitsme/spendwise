import { Email } from "@/modules/shared/domain/value-objects";
import {
  UserBasic,
  UserResolver,
} from "../../application/contracts/user-resolver";

export class DrizzleUserResolver implements UserResolver {
  async resolveOne(email: Email): Promise<UserBasic | undefined> {
    throw "Not Implemented";
  }

  async resolveMany(emails: Email[]): Promise<UserBasic[]> {
    throw "Not Implemented";
  }
}
