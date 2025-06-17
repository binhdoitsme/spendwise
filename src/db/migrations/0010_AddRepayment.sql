CREATE TABLE "repayments" (
	"id" text PRIMARY KEY NOT NULL,
	"currency" text NOT NULL,
	"account_id" text NOT NULL,
	"journal_id" text NOT NULL,
	"amount" numeric NOT NULL,
	"date" date NOT NULL,
	"statement_period_start" date NOT NULL,
	"statement_period_end" date NOT NULL,
	CONSTRAINT "repayment_keys" UNIQUE("account_id","journal_id","statement_period_start")
);
--> statement-breakpoint
DROP VIEW "public"."monthly_journal_tag_reports";--> statement-breakpoint
ALTER TABLE "transactions" DROP COLUMN IF EXISTS "paid_off_transaction";--> statement-breakpoint
ALTER TABLE "transactions" DROP COLUMN IF EXISTS "related_transactions";--> statement-breakpoint
CREATE VIEW "public"."monthly_journal_tag_reports" AS (
  SELECT
    ranked.journal_id,
    ranked.month,
    tg."name" AS tag,
    ranked.total_amount,
    ranked.rank,
    currency
  FROM (
    SELECT
      t.journal_id,
      DATE_TRUNC('month', t.date) AS month,
      tag,
      SUM(t.amount) AS total_amount,
      ROW_NUMBER() OVER (PARTITION BY t.journal_id,
        DATE_TRUNC('month', t.date)
        ORDER BY
          SUM(t.amount)
          DESC) AS rank
      FROM
        transactions t,
        UNNEST(t.tags) AS tag
      GROUP BY
        t.journal_id,
        month,
        tag) ranked
  LEFT JOIN journals j ON ranked.journal_id = j.id
  LEFT JOIN tags tg ON ranked.tag = tg.id
  WHERE
    rank <= 3
  ORDER BY
    journal_id,
    month,
    total_amount DESC);