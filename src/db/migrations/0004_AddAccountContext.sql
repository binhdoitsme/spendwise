CREATE TABLE "spendwise"."accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"user_id" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"bank_name" text,
	"last4" text,
	"statement_day" integer,
	"grace_period_in_days" integer,
	"credit_expiration_date" date,
	"limit" real,
	"loan_start_date" timestamp,
	"loan_end_date" timestamp,
	"original_amount" real,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'journal_accounts'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

ALTER TABLE "spendwise"."journal_accounts" DROP CONSTRAINT "journal_accounts_pkey";--> statement-breakpoint
ALTER TABLE "spendwise"."transactions" ALTER COLUMN "account" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "spendwise"."journal_accounts" ADD CONSTRAINT "journal_account_composite_pk" PRIMARY KEY("accountId","journalId");--> statement-breakpoint
ALTER TABLE "spendwise"."journal_accounts" DROP COLUMN "ownerEmail";--> statement-breakpoint
ALTER TABLE "spendwise"."journal_accounts" DROP COLUMN "gracePeriodDays";
