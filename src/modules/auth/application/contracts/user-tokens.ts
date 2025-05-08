export type UserMeta = {
  userId: string;
  email: string;
  refreshTokenId: string;
};

export async function getUserFromAccessToken(
  accessToken: string
): Promise<UserMeta> {
  return {
    userId: "user-id-1",
    email: "me@test.com",
    refreshTokenId: "refresh-token-1",
  };
}
