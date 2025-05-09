import { UserPayload } from "../dto/dtos.types";

export abstract class ITokenHandler {
  abstract generateAccessToken(payload: UserPayload): Promise<string>;
  abstract getUserFromAccessToken(
    accessToken: string
  ): Promise<UserPayload | undefined>;
}
