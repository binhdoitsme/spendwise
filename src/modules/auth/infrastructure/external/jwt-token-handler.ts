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
      .setExpirationTime(this.expiresIn)
      .sign(this.secretKey);

    return jwt;
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
