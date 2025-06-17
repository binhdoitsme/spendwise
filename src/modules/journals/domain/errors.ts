import { ApplicationError } from "@/modules/shared/base/errors";

export const journalErrors = {
  archivedJournal: {
    code: "TX-001",
    message: "Cannot add transactions to an archived journal",
  } as ApplicationError,
  journalNotAccessible: {
    code: "TX-002",
    message: `Cannot add transaction because this journal is not shared with user {user}`,
  } as ApplicationError,
  insufficientPaidOffTransaction: {
    code: "TX-003",
    message:
      "Payoff transaction amount must be greater than or equal to the sum of related transactions.",
  } as ApplicationError,
  accountAlreadyLinked: {
    code: "TX-004",
    message: "Account is already linked to this journal",
  } as ApplicationError,
  accountNotLinked: {
    code: "TX-005",
    message: "Account is not yet linked to this journal",
  } as ApplicationError,
  accountAlreadyInUse: {
    code: "TX-006",
    message: "Account is already in use in some transactions",
  } as ApplicationError,
  accountNotFound: {
    code: "TX-007",
    message: "Account is not found",
  },
} as const;
