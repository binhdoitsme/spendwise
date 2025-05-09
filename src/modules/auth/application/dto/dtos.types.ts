export interface SessionCreate {
  email: string;
  password: string;
}

export interface UserTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserPayload {
  userId: string;
  email: string;
  refreshTokenId: string;
}
