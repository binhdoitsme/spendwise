CREATE VIEW "public"."spending_category_spent_amounts" AS (
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
);