import { UUIDIdentifier } from "@/modules/shared/base/identifiers";
import { UserId } from "@/modules/shared/domain/identifiers";
import { DateTime } from "luxon";

export class RefreshTokenId extends UUIDIdentifier {}

function generateRandomToken(length: number): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    token += characters[randomIndex];
  }
  return token;
}

export class RefreshToken {
  private static readonly TOKEN_LENGTH = 128;
  private static readonly TOKEN_VALID_HOURS = 24;

  private _isRevoked: boolean;

  constructor(
    readonly token: string,
    readonly expiration: DateTime,
    readonly userId: UserId,
    readonly id: RefreshTokenId = new RefreshTokenId(),
    readonly createdAt: DateTime = DateTime.utc(),
    isRevoked: boolean = false
  ) {
    this._isRevoked = isRevoked;
  }

  get isRevoked(): boolean {
    return this._isRevoked;
  }

  isNearlyExpired(datetime: DateTime): boolean {
    return this.expiration.diff(datetime, "days").days < 1;
  }

  public expired(datetime: DateTime) {
    return this.expiration < datetime;
  }

  public revoke() {
    this._isRevoked = true;
  }

  public static new(userId: UserId): RefreshToken {
    const token = generateRandomToken(this.TOKEN_LENGTH);
    const expiration = DateTime.utc().plus({ hours: this.TOKEN_VALID_HOURS });
    return new RefreshToken(token, expiration, userId);
  }
}
