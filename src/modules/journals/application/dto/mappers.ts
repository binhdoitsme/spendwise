import { Journal } from "@/modules/journals/domain/journal";
import { RichJournal } from "@/modules/journals/domain/rich-journal";
import { Transaction } from "@/modules/journals/domain/transactions";
import { UserBasic } from "../contracts/user-resolver";
import {
  JournalBasicDto,
  JournalBasicWithTransactionsDto,
  JournalDetailedDto,
  UserBasicDto,
} from "./dtos.types";

function mapUserBasicToDto(user: UserBasic): UserBasicDto {
  return {
    email: user.email.value,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: user.avatar?.url,
  };
}

export function mapRichJournalToJournalDetailedDto(
  richJournal: RichJournal,
  users: UserBasic[]
): JournalDetailedDto {
  const { journal, transactions } = richJournal;
  const usersByEmail = users.reduce<Record<string, UserBasic>>(
    (prev, user) => ({
      ...prev,
      [user.email.value]: user,
    }),
    {}
  );

  return {
    id: journal.id.value,
    ownerId: journal.ownerId.value,
    ownerEmail: journal.ownerEmail.toString(),
    ownerFirstName:
      users.find((user) => user.email.equals(journal.ownerEmail))?.firstName ??
      "",
    ownerLastName:
      users.find((user) => user.email.equals(journal.ownerEmail))?.lastName ??
      "",
    title: journal.title,
    currency: journal.currency,
    isArchived: journal.isArchived,
    createdAt: journal.createdAt.toISODate()!,
    tags: Array.from(journal.tags.values()).map((tag) => ({
      id: tag.id,
      name: tag.name,
    })),
    accounts: Array.from(journal.accounts.values()).map((account) => ({
      accountId: account.accountId.value,
      ownerId: account.ownerId.value,
      ownerEmail: account.ownerEmail.toString(),
      gracePeriodDays: account.gracePeriodDays,
      createdAt: account.createdAt.toISODate()!,
    })),
    collaborators: Array.from(journal.collaborators.values()).map(
      (collaborator) => ({
        user: mapUserBasicToDto(usersByEmail[collaborator.email.value]),
        permission: collaborator.permission,
      })
    ),
    transactions: transactions.map((transaction) => ({
      id: transaction.id.value,
      title: transaction.title,
      amount: transaction.amount,
      date: transaction.date.toISODate()!,
      type: transaction.type,
      status: transaction.status,
      notes: transaction.notes,
      accountId: transaction.account.value,
      tags: transaction.tags,
    })),
  };
}

export function mapJournalToJournalBasicDto(journal: Journal): JournalBasicDto {
  return {
    id: journal.id.value,
    ownerId: journal.ownerId.value,
    ownerEmail: journal.ownerEmail.toString(),
    title: journal.title,
    isArchived: journal.isArchived,
    createdAt: journal.createdAt.toISODate()!,
    currency: journal.currency,
  };
}

export function mapJournalToJournalBasicWithTransactionsDto(
  journal: Journal,
  transactions: Transaction[]
): JournalBasicWithTransactionsDto {
  return {
    ...mapJournalToJournalBasicDto(journal),
    transactions: transactions.map((transaction) => ({
      id: transaction.id.value,
      title: transaction.title,
      amount: transaction.amount,
      date: transaction.date.toISODate()!,
      type: transaction.type,
      accountId: transaction.account.value,
      status: transaction.status,
      tags: transaction.tags,
      notes: transaction.notes,
    })),
  };
}
