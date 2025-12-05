ALTER TABLE "spendwise"."journals" ALTER COLUMN "requiresApproval" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "spendwise"."journals" ALTER COLUMN "isArchived" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "spendwise"."journals" ADD COLUMN "currency" char(3) NOT NULL;
