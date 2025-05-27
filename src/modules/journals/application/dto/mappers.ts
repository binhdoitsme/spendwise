import { Journal } from "@/modules/journals/domain/journal";
import { RichJournal } from "@/modules/journals/domain/rich-journal";
import { Transaction } from "@/modules/journals/domain/transactions";
import { AccountBasic } from "../contracts/account-resolver";
import { JournalUserBasic } from "../contracts/user-resolver";
import {
  JournalBasicDto,
  JournalBasicWithTransactionsDto,
  JournalDetailedDto,
  JournalUserBasicDto,
  TransactionDetailedDto,
} from "./dtos.types";

function mapUserBasicToDto(user: JournalUserBasic): JournalUserBasicDto {
  return {
    id: user.id.value,
    email: user.email.value,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: user.avatar?.url,
  };
}

export function mapRichJournalToJournalDetailedDto(
  richJournal: RichJournal,
  users: JournalUserBasic[],
  accounts: AccountBasic[]
): JournalDetailedDto {
  const { journal, transactions } = richJournal;
  const usersById = users.reduce<Record<string, JournalUserBasic>>(
    (prev, user) => ({
      ...prev,
      [user.id.value]: user,
    }),
    {}
  );
  const accountsById = accounts.reduce<Record<string, AccountBasic>>(
    (prev, account) => ({
      ...prev,
      [account.id.value]: account,
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
      displayName: accountsById[account.accountId.value].displayName,
      type: accountsById[account.accountId.value].type,
      owner: {
        userId: usersById[account.ownerId.value].id.value,
        email: usersById[account.ownerId.value].email.value,
        firstName: usersById[account.ownerId.value].firstName,
        lastName: usersById[account.ownerId.value].lastName,
      },
    })),
    collaborators: Array.from(journal.collaborators.values()).map(
      (collaborator) => ({
        user: mapUserBasicToDto(usersById[collaborator.userId.value]),
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
      paidBy: transaction.paidBy.value,
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

export function mapTransactionToDetailedDto(
  transaction: Transaction
): TransactionDetailedDto {
  return {
    id: transaction.id.value,
    title: transaction.title,
    amount: transaction.amount,
    date: transaction.date.toISODate()!,
    type: transaction.type,
    accountId: transaction.account.value,
    paidBy: transaction.paidBy.value,
    status: transaction.status,
    tags: transaction.tags,
    notes: transaction.notes,
  };
}

export function mapJournalToJournalBasicWithTransactionsDto(
  journal: Journal,
  transactions: Transaction[]
): JournalBasicWithTransactionsDto {
  return {
    ...mapJournalToJournalBasicDto(journal),
    transactions: transactions.map(mapTransactionToDetailedDto),
  };
}
