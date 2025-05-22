import { relations } from "drizzle-orm";
import {
  boolean,
  char,
  date,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  varchar
} from "drizzle-orm/pg-core";

export const journalAccounts = pgTable(
  "journal_accounts",
  {
    accountId: text().notNull(),
    journalId: text().notNull(),
    ownerId: text().notNull(),
    createdAt: date({ mode: "date" }).notNull(),
  },
  (table) => [
    primaryKey({
      name: "journal_account_composite_pk",
      columns: [table.accountId, table.journalId],
    }),
  ]
);

export const journalPermissions = pgEnum("journal_permissions", [
  "owner",
  "read",
  "write",
]);

export const collaborators = pgTable("collaborators", {
  userId: varchar({ length: 255 }).primaryKey(),
  permission: journalPermissions().notNull(),
  journalId: text().notNull(),
});

export const tags = pgTable(
  "tags",
  {
    id: text(),
    name: varchar({ length: 100 }).notNull(),
    journalId: text().notNull(),
  },
  (table) => [
    primaryKey({ name: "tags_pkey", columns: [table.id, table.journalId] }),
  ]
);

export const journals = pgTable("journals", {
  id: text().primaryKey(),
  ownerId: text().notNull(),
  ownerEmail: varchar({ length: 255 }).notNull(),
  title: varchar({ length: 200 }).notNull(),
  currency: char({ length: 3 }).notNull(),
  requiresApproval: boolean().default(false).notNull(),
  isArchived: boolean().default(false).notNull(),
  createdAt: date({ mode: "date" }).notNull(),
});

export const transactionTypeEnum = pgEnum("transaction_types", [
  "INCOME",
  "EXPENSE",
  "TRANSFER",
]);

export const transactionStatusEnum = pgEnum("transaction_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "AUTO_APPROVED",
]);

export const transactions = pgTable("transactions", {
  id: text().primaryKey(),
  journalId: text().notNull(),
  title: varchar({ length: 200 }).notNull(),
  amount: numeric({ mode: "number" }).notNull(),
  date: date({ mode: "date" }).notNull(),
  account: text().notNull(),
  type: transactionTypeEnum().notNull(),
  paidBy: varchar({ length: 255 }).notNull(),
  tags: varchar().array(),
  status: transactionStatusEnum().notNull(),
  notes: text(),
  paidOffTransaction: text(),
  relatedTransactions: text().array(),
});

export const accountsRelations = relations(journalAccounts, ({ one }) => ({
  journal: one(journals, {
    fields: [journalAccounts.journalId],
    references: [journals.id],
  }),
}));

export const collaboratorsRelations = relations(collaborators, ({ one }) => ({
  journal: one(journals, {
    fields: [collaborators.journalId],
    references: [journals.id],
  }),
}));

export const tagsRelations = relations(tags, ({ one }) => ({
  journal: one(journals, {
    fields: [tags.journalId],
    references: [journals.id],
  }),
}));

export const journalsRelations = relations(journals, ({ many }) => ({
  tags: many(tags),
  accounts: many(journalAccounts),
  collaborators: many(collaborators),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  journal: one(journals, {
    fields: [transactions.journalId],
    references: [journals.id],
  }),
}));
