import { UserId } from "@/modules/shared/domain/identifiers";
import { User } from "./user";
import { Email } from "@/modules/shared/domain/value-objects";

export abstract class UserRepository {
  abstract save(user: User): Promise<void>;
  abstract findById(id: UserId): Promise<User | undefined>;
  abstract findByEmail(email: Email): Promise<User | undefined>;
}
