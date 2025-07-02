import { Email, IPasswordHasher } from "@/modules/shared/domain/value-objects";
import { DateTime } from "luxon";
import { RefreshToken } from "../../domain/refresh-token";
import {
  AuthUserRepository,
  RefreshTokenRepository,
} from "../../domain/repositories";
import { ITokenHandler } from "../contracts/token-handler";
import { SessionCreate, UserPayload, UserTokens } from "../dto/dtos.types";

export class AuthServices {
  constructor(
    private readonly userRepository: AuthUserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenHandler: ITokenHandler
  ) {}

  async createSession({
    email,
    password,
  }: SessionCreate): Promise<UserTokens | undefined> {
    const user = await this.userRepository.findByEmail(Email.from(email));
    if (!user || !user.password.verify(password, this.passwordHasher)) {
      return undefined;
    }
    const refreshToken = RefreshToken.new(user.id);
    await this.refreshTokenRepository.save(refreshToken);
    const payload: UserPayload = {
      userId: user.id.value,
      email: user.email.value,
      refreshTokenId: refreshToken.id.value,
    };
    const accessToken = await this.tokenHandler.generateAccessToken(payload);
    return {
      accessToken,
      refreshToken: refreshToken.token,
    };
  }

  async refreshSession(token: string): Promise<UserTokens | undefined> {
    let refreshToken = await this.refreshTokenRepository.findByToken(token);
    const now = DateTime.utc();
    if (!refreshToken || refreshToken.expired(now)) {
      return undefined;
    }
    const user = await this.userRepository.findById(refreshToken.userId);
    if (!user) {
      return undefined;
    }
    if (refreshToken.isNearlyExpired(now)) {
      const oldId = refreshToken.id;
      refreshToken = RefreshToken.new(user.id);
      await this.refreshTokenRepository.delete(oldId);
      await this.refreshTokenRepository.save(refreshToken);
    }
    const payload: UserPayload = {
      userId: user.id.value,
      email: user.email.value,
      refreshTokenId: refreshToken.id.value,
    };
    const accessToken = await this.tokenHandler.generateAccessToken(payload);
    return {
      accessToken,
      refreshToken: refreshToken.token,
    };
  }

  async clearSession(token: string): Promise<void> {
    const refreshToken = await this.refreshTokenRepository.findByToken(token);
    if (!refreshToken) {
      return;
    }
    await this.refreshTokenRepository.delete(refreshToken.id);
  }
}
