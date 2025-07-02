import { relations, sql } from "drizzle-orm";
import {
  boolean,
  char,
  date,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  varchar,
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
  updatedAt: timestamp("updated_at", { mode: "date" }).default(
    sql`(CURRENT_TIMESTAMP AT TIME ZONE 'UTC')`
  ),
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
});

export const repayments = pgTable(
  "repayments",
  {
    id: text("id").primaryKey(),
    currency: text("currency").notNull(),
    accountId: text("account_id").notNull(),
    journalId: text("journal_id").notNull(),
    amount: numeric("amount", { mode: "number" }).notNull(),
    date: date("date", { mode: "date" }).notNull(),
    statementPeriodStart: date("statement_period_start", {
      mode: "date",
    }).notNull(),
    statementPeriodEnd: date("statement_period_end", {
      mode: "date",
    }).notNull(),
  },
  (t) => [
    unique("repayment_keys").on(
      t.accountId,
      t.journalId,
      t.statementPeriodStart
    ),
  ]
);

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
  repayments: many(repayments),
}));

export const repaymentsRelations = relations(repayments, ({ one }) => ({
  journal: one(journals, {
    fields: [repayments.journalId],
    references: [journals.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  journal: one(journals, {
    fields: [transactions.journalId],
    references: [journals.id],
  }),
}));
