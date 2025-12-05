import { baseSchema } from "@/modules/shared/infrastructure/base-schema";
import { sql } from "drizzle-orm";
import {
  date,
  numeric,
  text,
  timestamp,
  varchar
} from "drizzle-orm/pg-core";

export const spendingCategories = baseSchema.table("spending_categories", {
  id: text("id").primaryKey(),
  journalId: text("journal_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  type: text("type").notNull(),
  limit: numeric("limit", {
    precision: 10,
    scale: 2,
    mode: "number",
  }).notNull(),
  currency: text("currency").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
});

export const spendingCategorySpentAmounts = baseSchema.view(
  "spending_category_spent_amounts",
  {
    journalId: text("journal_id").notNull(),
    categoryId: text("category_id").notNull(),
    month: date("month", { mode: "date" }).notNull(),
    spent: numeric("spent", { mode: "number" }).notNull(),
  }
).as(sql`
  SELECT
    DATE_TRUNC('month', t.date) AS month,
    SUM(
      CASE WHEN t.type = 'EXPENSE' THEN
        t.amount
      ELSE
        0
      END) AS spent,
    t.category_id,
    t.journal_id
  FROM
    transactions t
  GROUP BY
    month,
    category_id,
    journal_id
`);
