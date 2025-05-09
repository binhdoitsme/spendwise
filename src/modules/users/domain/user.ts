import { UserId } from "@/modules/shared/domain/identifiers";
import { Email, Password } from "@/modules/shared/domain/value-objects";
import { DateTime } from "luxon";
import { UserProfile } from "./profile";

export class User {
  constructor(
    readonly email: Email,
    readonly password: Password,
    readonly profile?: UserProfile,
    readonly id: UserId = new UserId(),
    readonly createdAt: DateTime = DateTime.utc()
  ) {}

  static restore(data: {
    id: UserId;
    email: Email;
    password: Password;
    profile?: UserProfile;
    createdAt: DateTime;
  }): User {
    return new User(
      data.email,
      data.password,
      data.profile,
      data.id,
      data.createdAt
    );
  }
}
