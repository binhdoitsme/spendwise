CREATE TABLE "spendwise"."spending_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"journal_id" text NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" text NOT NULL,
	"limit" numeric(10, 2) NOT NULL,
	"currency" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "spendwise"."transactions" ADD COLUMN "category_id" text;
