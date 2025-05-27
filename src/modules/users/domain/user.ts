import { UserId } from "@/modules/shared/domain/identifiers";
import { Email, Password } from "@/modules/shared/domain/value-objects";
import { DateTime } from "luxon";
import { UserProfile } from "./profile";

export class User {
  constructor(
    readonly email: Email,
    private _password: Password,
    private _profile?: UserProfile,
    readonly id: UserId = new UserId(),
    readonly createdAt: DateTime = DateTime.utc()
  ) {}

  get profile(): UserProfile | undefined {
    return this._profile;
  }

  get password(): Password {
    return this._password;
  }

  updateProfile(profile: UserProfile): void {
    this._profile = { ...profile };
  }

  updatePassword(password: Password): void {
    this._password = password;
  }

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
