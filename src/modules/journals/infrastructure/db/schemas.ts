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
    accountId: text("account_id").notNull(),
    journalId: text("journal_id").notNull(),
    ownerId: text("owner_id").notNull(),
    createdAt: date("created_at", { mode: "date" }).notNull(),
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
  userId: varchar("user_id", { length: 255 }).primaryKey(),
  permission: journalPermissions().notNull(),
  journalId: text("journal_id").notNull(),
});

export const tags = pgTable(
  "tags",
  {
    id: text("id"),
    name: varchar("name", { length: 100 }).notNull(),
    journalId: text("journal_id").notNull(),
  },
  (table) => [
    primaryKey({ name: "tags_pkey", columns: [table.id, table.journalId] }),
  ]
);

export const journals = pgTable("journals", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  ownerEmail: varchar("owner_email", { length: 255 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  currency: char("currency", { length: 3 }).notNull(),
  requiresApproval: boolean("requires_approval").default(false).notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
  createdAt: date("created_at", { mode: "date" }).notNull(),
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
  id: text("id").primaryKey(),
  journalId: text("journal_id").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  amount: numeric("amount", { mode: "number" }).notNull(),
  date: date("date", { mode: "date" }).notNull(),
  account: text("account").notNull(),
  type: transactionTypeEnum("type").notNull(),
  paidBy: varchar("paid_by", { length: 255 }).notNull(),
  tags: varchar("tags").array(),
  status: transactionStatusEnum("status").notNull(),
  notes: text("notes"),
  paidOffTransaction: text("paid_off_transaction"),
  relatedTransactions: text("related_transactions").array(),
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
