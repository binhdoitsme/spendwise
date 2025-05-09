import { UserId } from "@/modules/shared/domain/identifiers";
import { Email } from "@/modules/shared/domain/value-objects";
import { AuthUser } from "./auth-user";
import { RefreshToken, RefreshTokenId } from "./refresh-token";

export abstract class AuthUserRepository {
  abstract findByEmail(email: Email): Promise<AuthUser | undefined>;
  abstract findById(id: UserId): Promise<AuthUser | undefined>;
}

export abstract class RefreshTokenRepository {
  abstract findById(id: RefreshTokenId): Promise<RefreshToken | undefined>;
  abstract findByToken(token: string): Promise<RefreshToken | undefined>;
  abstract save(token: RefreshToken): Promise<void>;
  abstract delete(id: RefreshTokenId): Promise<void>;
}
