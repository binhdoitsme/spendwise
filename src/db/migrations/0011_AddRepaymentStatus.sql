DROP VIEW IF EXISTS "monthly_account_reports";--> statement-breakpoint
CREATE VIEW "monthly_account_reports" AS (
  SELECT
    a.id AS account_id,
    a.type AS account_type,
    a.user_id AS user_id,
    j.currency AS currency,
    t.type AS "transaction_type",
    -- Due Date Logic
    CASE WHEN a.type = 'credit' THEN
      -- statement_end_date + grace_period_in_days
      CASE WHEN a.statement_day IS NOT NULL THEN
        CASE WHEN EXTRACT(DAY FROM t.date) >= a.statement_day THEN
        (make_date (EXTRACT(YEAR FROM t.date + interval '1 month')::int,
            EXTRACT(MONTH FROM t.date + interval '1 month')::int,
            a.statement_day) - interval '1 day') + (a.grace_period_in_days || ' days')::interval
      ELSE
        (make_date (EXTRACT(YEAR FROM t.date)::int,
            EXTRACT(MONTH FROM t.date)::int,
            a.statement_day) - interval '1 day') + (a.grace_period_in_days || ' days')::interval
        END
      ELSE
        ((DATE_TRUNC('month', t.date) + interval '1 month - 1 day')::date + a.grace_period_in_days)
      END
    WHEN a.type = 'loan' THEN
      a.loan_end_date
    ELSE
      NULL
    END AS due_date,
    -- Statement Period Start (use statement_day if available, else 1st of month)
    CASE WHEN a.statement_day IS NOT NULL THEN
      -- If today is June 1st and statement_day is 15, then last month's 15th
      CASE WHEN EXTRACT(DAY FROM t.date) >= a.statement_day THEN
        make_date (EXTRACT(YEAR FROM t.date)::int,
          EXTRACT(MONTH FROM t.date)::int,
          a.statement_day)
      ELSE
        make_date (EXTRACT(YEAR FROM t.date - interval '1 month')::int,
          EXTRACT(MONTH FROM t.date - interval '1 month')::int,
          a.statement_day)
      END
    ELSE
      DATE_TRUNC('month', t.date)::date
    END AS statement_start_date,
    -- Statement Period End (1 day before next statement_day, or end of month)
    CASE WHEN a.statement_day IS NOT NULL THEN
      CASE WHEN EXTRACT(DAY FROM t.date) >= a.statement_day THEN
      (make_date (EXTRACT(YEAR FROM t.date + interval '1 month')::int,
          EXTRACT(MONTH FROM t.date + interval '1 month')::int,
          a.statement_day) - interval '1 day')::date
    ELSE
      (make_date (EXTRACT(YEAR FROM t.date)::int,
          EXTRACT(MONTH FROM t.date)::int,
          a.statement_day) - interval '1 day')::date
      END
    ELSE
      (DATE_TRUNC('month', t.date) + interval '1 month - 1 day')::date
    END AS statement_end_date,
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
      END) AS "limit",
  SUM(CASE WHEN r.id IS NOT NULL THEN 1 ELSE 0 END) > 0 AS repayment_status
  FROM
    accounts a
    LEFT JOIN journal_accounts ja ON a.id = ja.account_id
    LEFT JOIN journals j ON ja.journal_id = j.id
    LEFT JOIN transactions t ON t.account = a.id
    LEFT JOIN repayments r ON r.account_id = a.id
      AND r.statement_period_start = CASE WHEN a.statement_day IS NOT NULL THEN
        -- If today is June 1st and statement_day is 15, then last month's 15th
        CASE WHEN EXTRACT(DAY FROM t.date) >= a.statement_day THEN
          make_date (EXTRACT(YEAR FROM t.date)::int,
            EXTRACT(MONTH FROM t.date)::int,
            a.statement_day)
        ELSE
          make_date (EXTRACT(YEAR FROM t.date - interval '1 month')::int,
            EXTRACT(MONTH FROM t.date - interval '1 month')::int,
            a.statement_day)
        END
      ELSE
        DATE_TRUNC('month', t.date)::date
      END
    GROUP BY
      a.id,
      a.type,
      a.user_id,
      ja.journal_id,
      t.type,
      j.currency,
      statement_start_date,
      statement_end_date,
      due_date
    HAVING
      t.type IS NOT NULL
      AND j.currency IS NOT NULL);