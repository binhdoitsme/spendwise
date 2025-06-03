CREATE VIEW "public"."monthly_journal_account_reports" AS (
  SELECT
    journal_id,
    SUM(amount) AS total_amount,
    account,
    date_trunc('month', date) AS "month",
    currency
  FROM
    transactions
    LEFT JOIN journals ON transactions.journal_id = journals.id
  WHERE
    TYPE = 'EXPENSE'
  GROUP BY
    journal_id,
    currency,
    account,
    "month"
  ORDER BY
    "month" DESC,
    total_amount DESC);--> statement-breakpoint
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