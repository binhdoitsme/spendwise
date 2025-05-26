import { ApplicationError } from "@/modules/shared/base/errors";

export const reportErrors = {
  accountIdNotProvided: {
    code: "REPORT-000",
    message: "Account IDs or Journal ID must be provided",
  } as ApplicationError,
} as const;
