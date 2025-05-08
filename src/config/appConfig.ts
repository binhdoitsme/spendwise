export const appConfig = {
  userIdHeader: process.env.USER_ID_HEADER ?? "X-User-ID",
} as const;
