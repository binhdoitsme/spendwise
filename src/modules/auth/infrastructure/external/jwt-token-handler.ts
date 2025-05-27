import { jwtVerify, SignJWT } from "jose";
import { ITokenHandler } from "../../application/contracts/token-handler";
import { UserPayload } from "../../application/dto/dtos.types";

export class JwtTokenHandler implements ITokenHandler {
  private readonly secretKey: Uint8Array;
  private readonly expiresIn: string;

  constructor(secretKey: string, expiresIn: string) {
    this.secretKey = new TextEncoder().encode(secretKey);
    this.expiresIn = expiresIn;
  }

  async generateAccessToken(payload: UserPayload): Promise<string> {
    const jwt = await new SignJWT(payload as unknown as Record<string, string>)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(this.parseExpirationTime(this.expiresIn))
      .sign(this.secretKey);

    return jwt;
  }

  private parseExpirationTime(expiresIn: string): number {
    // Handle common time unit formats
    const units: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (match) {
      const [, value, unit] = match;
      return Math.floor(Date.now() / 1000) + Number(value) * units[unit];
    }

    // If it's already a number in seconds
    if (!isNaN(Number(expiresIn))) {
      return Math.floor(Date.now() / 1000) + Number(expiresIn);
    }

    throw new Error('Invalid expiration time format. Use <number>[s|m|h|d] or seconds');
  }

  async getUserFromAccessToken(
    accessToken: string
  ): Promise<UserPayload | undefined> {
    try {
      const { payload } = await jwtVerify(accessToken, this.secretKey);
      return {
        email: payload.email as string,
        userId: payload.userId as string,
        refreshTokenId: payload.refreshTokenId as string,
      };
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }
}
