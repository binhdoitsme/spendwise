import { sql } from "drizzle-orm";
import { date, numeric, pgView, text } from "drizzle-orm/pg-core";

export const monthlyAccountReports = pgView("monthly_account_reports", {
  accountId: text("account_id").notNull(),
  accountType: text("account_type").notNull(),
  userId: text("user_id").notNull(),
  month: text("month").notNull(),
  transactionType: text("transaction_type").notNull(),
  dueDate: date("due_date", { mode: "date" }),
  journalId: text("journal_id").notNull(),
  totalAmount: numeric("total_amount", { mode: "number" }).notNull(),
  limit: numeric("limit", { mode: "number" }),
  currency: text("currency").notNull(),
}).as(
  sql`
  SELECT
    a.id AS account_id,
    a.type AS account_type,
    a.user_id AS user_id,
    j.currency AS currency,
    TO_CHAR(t.date, 'YYYYMM') AS "month",
    t.type AS "transaction_type",
    CASE WHEN a.type = 'credit' THEN
      CONCAT(TO_CHAR(t.date + interval '1 month', 'YYYYMM'), LPAD((a.statement_day + a.grace_period_in_days - 1)::text, 2, '0'))::date
    WHEN a.type = 'loan' THEN
      a.loan_end_date
    ELSE
      NULL
    END AS due_date,
    ja.journal_id AS journal_id,
    SUM(
      CASE WHEN t.amount IS NOT NULL THEN
        t.amount
      ELSE
        0
      END) AS total_amount,
    MAX(
      CASE WHEN a.type = 'loan' THEN
        a.original_amount
      WHEN a.type = 'credit' THEN
        a. "limit"
      ELSE
        NULL
      END) AS
  LIMIT
  FROM
    accounts a
    LEFT JOIN journal_accounts ja ON a.id = ja.account_id
    LEFT JOIN journals j ON ja.journal_id = j.id
    LEFT JOIN transactions t ON t.account = a.id
  GROUP BY
    a.id,
    a.type,
    a.user_id,
    ja.journal_id,
    t.type,
    j.currency,
    "month",
    "due_date"
  HAVING
    t.type IS NOT NULL
    AND j.currency IS NOT NULL`
);
