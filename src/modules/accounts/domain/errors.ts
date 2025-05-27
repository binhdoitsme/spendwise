import { ApplicationError } from "@/modules/shared/base/errors";

export const accountErrors = {
  alreadyHadCashAccount: {
    code: "ACC-001",
    message: "One user cannot have multiple cash account",
  } as ApplicationError,
  invalidAccountType: {
    code: "ACC-002",
    message: "Invalid account type: {accountType}",
  } as ApplicationError,
} as const;
