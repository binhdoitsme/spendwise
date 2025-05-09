import { ApplicationError } from "@/modules/shared/base/errors";

export const userErrors = {
  unknownError: {
    code: "USER-000",
    message: "An unexpected error occurred",
  } as ApplicationError,
  existingUser: {
    code: "USER-001",
    message: "This email has already been taken",
  } as ApplicationError,
} as const;
