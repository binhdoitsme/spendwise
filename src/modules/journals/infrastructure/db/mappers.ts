import { AccountId, UserId } from "@/modules/shared/domain/identifiers";
import { Email } from "@/modules/shared/domain/value-objects";
import { DateTime, Interval } from "luxon";
import { JournalAccount } from "../../domain/account";
import { Collaborator } from "../../domain/collaborator";
import { Journal, JournalId as JournalDomainId } from "../../domain/journal";
import { Repayment } from "../../domain/repayments";
import { Tag } from "../../domain/tag";
import {
  Transaction,
  TransactionId,
  TransactionStatus,
  TransactionType,
} from "../../domain/transactions";
import {
  collaborators,
  journalAccounts,
  journals,
  repayments,
  tags,
  transactions,
} from "./schemas";

// Define types for the rows of the tables
type CollaboratorSchema = typeof collaborators.$inferSelect;
type TagSchema = typeof tags.$inferSelect;
type AccountSchema = typeof journalAccounts.$inferSelect;
type JournalSchema = typeof journals.$inferSelect;
type RichJournalSchema = JournalSchema & {
  [collaborators._.name]: CollaboratorSchema[];
  [tags._.name]: TagSchema[];
  accounts: AccountSchema[];
  repayments: RepaymentSchema[];
};
type TransactionSchema = typeof transactions.$inferSelect;
type RepaymentSchema = typeof repayments.$inferSelect;

export const mapJournalToDomain = (schema: RichJournalSchema): Journal => {
  return Journal.restore({
    id: new JournalDomainId(schema.id),
    ownerId: new UserId(schema.ownerId),
    ownerEmail: Email.from(schema.ownerEmail),
    title: schema.title,
    currency: schema.currency,
    requiresApproval: schema.requiresApproval,
    isArchived: schema.isArchived,
    createdAt: DateTime.fromJSDate(schema.createdAt, { zone: "utc" }),
    updatedAt: DateTime.fromJSDate(schema.updatedAt!, { zone: "utc" }),
    accounts: schema.accounts
      .map((account) => mapAccountToDomain(account))
      .reduce<Map<string, JournalAccount>>((current, next) => {
        current.set(next.accountId.value, next);
        return current;
      }, new Map()),
    collaborators: schema.collaborators
      .map((collaborator) => mapCollaboratorToDomain(collaborator))
      .reduce<Map<string, Collaborator>>((current, next) => {
        current.set(next.userId.value, next);
        return current;
      }, new Map()),
    tags: schema.tags
      .map((tag) => mapTagToDomain(tag))
      .reduce((current, next) => {
        current.set(next.id, next);
        return current;
      }, new Map()),
    repayments: schema.repayments.map(mapRepaymentToDomain),
  });
};

export const mapJournalFromDomain = (
  journal: Journal
): [JournalSchema, AccountSchema[], CollaboratorSchema[], TagSchema[]] => {
  return [
    {
      id: journal.id.value,
      ownerId: journal.ownerId.value,
      ownerEmail: journal.ownerEmail.toString(),
      title: journal.title,
      currency: journal.currency,
      requiresApproval: journal.requiresApproval,
      isArchived: journal.isArchived,
      createdAt: journal.createdAt.toJSDate(),
      updatedAt: journal.updatedAt?.toJSDate(),
    },
    Array.from(journal.accounts.values()).map((account) => ({
      journalId: journal.id.value,
      accountId: account.accountId.value,
      ownerId: account.ownerId.value,
      createdAt: account.createdAt.toJSDate(),
    })),
    Array.from(journal.collaborators.values()).map((collaborator) => ({
      journalId: journal.id.value,
      userId: collaborator.userId.value,
      permission: collaborator.permission,
    })),
    Array.from(journal.tags.values()).map((tag) => ({
      journalId: journal.id.value,
      id: tag.id,
      name: tag.name,
    })),
  ];
};

export const mapTransactionToDomain = (
  schema: TransactionSchema
): Transaction => {
  return Transaction.restore({
    id: new TransactionId(schema.id),
    journalId: new JournalDomainId(schema.journalId),
    title: schema.title,
    amount: schema.amount,
    date: DateTime.fromJSDate(schema.date, { zone: "utc" }),
    account: new AccountId(schema.account),
    type: TransactionType[schema.type],
    paidBy: new UserId(schema.paidBy),
    tags: schema.tags ?? [],
    status: TransactionStatus[schema.status],
    notes: schema.notes ?? undefined,
  });
};

export const mapTransactionFromDomain = (
  transaction: Transaction
): TransactionSchema => {
  return {
    id: transaction.id.value,
    journalId: transaction.journalId.value,
    title: transaction.title,
    amount: transaction.amount,
    date: transaction.date.toJSDate(),
    account: transaction.account.value,
    type: transaction.type,
    paidBy: transaction.paidBy.value,
    tags: transaction.tags,
    status: transaction.status,
    notes: transaction.notes ?? null,
  };
};

export const mapAccountToDomain = (schema: AccountSchema): JournalAccount => {
  return new JournalAccount(
    new AccountId(schema.accountId),
    new UserId(schema.ownerId),
    DateTime.fromJSDate(schema.createdAt, { zone: "utc" })
  );
};

export const mapCollaboratorToDomain = (
  schema: CollaboratorSchema
): Collaborator => {
  return new Collaborator(new UserId(schema.userId), schema.permission);
};

export const mapTagToDomain = (schema: TagSchema): Tag => {
  return new Tag(schema.name);
};

export const mapRepaymentToDomain = (schema: RepaymentSchema): Repayment => {
  return Repayment.restore({
    id: schema.id,
    accountId: schema.accountId,
    journalId: schema.journalId,
    amount: schema.amount,
    currency: schema.currency,
    date: DateTime.fromJSDate(schema.date, { zone: "utc" }),
    statementPeriod: Interval.fromDateTimes(
      DateTime.fromJSDate(schema.statementPeriodStart, { zone: "utc" }),
      DateTime.fromJSDate(schema.statementPeriodEnd, { zone: "utc" })
    ),
  });
};

export const mapRepaymentFromDomain = (
  repayment: Repayment
): RepaymentSchema => {
  return {
    id: repayment.id.value,
    accountId: repayment.accountId.value,
    journalId: repayment.journalId.value,
    amount: repayment.amount.amount,
    currency: repayment.amount.currency,
    date: repayment.date.toJSDate(),
    statementPeriodStart: repayment.statementPeriod.start!.toJSDate(),
    statementPeriodEnd: repayment.statementPeriod.end!.toJSDate(),
  };
};
