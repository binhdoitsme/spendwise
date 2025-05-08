import { DomainError } from "@/modules/shared/base/errors";

export const journalErrors = {
  archivedJournal: {
    code: "TX-001",
    message: "Cannot add transactions to an archived journal",
  } as DomainError,
  journalNotAccessible: {
    code: "TX-002",
    message: `Cannot add transaction because this journal is not shared with user {user}`,
  } as DomainError,
  insufficientPaidOffTransaction: {
    code: "TX-003",
    message:
      "Payoff transaction amount must be greater than or equal to the sum of related transactions.",
  } as DomainError,
} as const;
