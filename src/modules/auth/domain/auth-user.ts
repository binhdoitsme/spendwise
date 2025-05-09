import { UserId } from "@/modules/shared/domain/identifiers";
import { Email, Password } from "@/modules/shared/domain/value-objects";

export class AuthUser {
  constructor(readonly id: UserId, readonly email: Email, readonly password: Password) {}
}
