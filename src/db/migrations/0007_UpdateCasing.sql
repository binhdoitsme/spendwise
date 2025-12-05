ALTER TABLE "spendwise"."refresh_token" RENAME COLUMN "isRevoked" TO "is_revoked";--> statement-breakpoint
ALTER TABLE "spendwise"."refresh_token" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "spendwise"."refresh_token" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "spendwise"."collaborators" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "spendwise"."collaborators" RENAME COLUMN "journalId" TO "journal_id";--> statement-breakpoint
ALTER TABLE "spendwise"."journal_accounts" RENAME COLUMN "accountId" TO "account_id";--> statement-breakpoint
ALTER TABLE "spendwise"."journal_accounts" RENAME COLUMN "journalId" TO "journal_id";--> statement-breakpoint
ALTER TABLE "spendwise"."journal_accounts" RENAME COLUMN "ownerId" TO "owner_id";--> statement-breakpoint
ALTER TABLE "spendwise"."journal_accounts" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "spendwise"."journals" RENAME COLUMN "ownerId" TO "owner_id";--> statement-breakpoint
ALTER TABLE "spendwise"."journals" RENAME COLUMN "ownerEmail" TO "owner_email";--> statement-breakpoint
ALTER TABLE "spendwise"."journals" RENAME COLUMN "requiresApproval" TO "requires_approval";--> statement-breakpoint
ALTER TABLE "spendwise"."journals" RENAME COLUMN "isArchived" TO "is_archived";--> statement-breakpoint
ALTER TABLE "spendwise"."journals" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "spendwise"."tags" RENAME COLUMN "journalId" TO "journal_id";--> statement-breakpoint
ALTER TABLE "spendwise"."transactions" RENAME COLUMN "journalId" TO "journal_id";--> statement-breakpoint
ALTER TABLE "spendwise"."transactions" RENAME COLUMN "paidBy" TO "paid_by";--> statement-breakpoint
ALTER TABLE "spendwise"."transactions" RENAME COLUMN "paidOffTransaction" TO "paid_off_transaction";--> statement-breakpoint
ALTER TABLE "spendwise"."transactions" RENAME COLUMN "relatedTransactions" TO "related_transactions";--> statement-breakpoint
ALTER TABLE "spendwise"."profiles" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "spendwise"."profiles" RENAME COLUMN "firstName" TO "first_name";--> statement-breakpoint
ALTER TABLE "spendwise"."profiles" RENAME COLUMN "lastName" TO "last_name";--> statement-breakpoint
ALTER TABLE "spendwise"."profiles" RENAME COLUMN "avatarUrl" TO "avatar_url";--> statement-breakpoint
ALTER TABLE "spendwise"."users" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "spendwise"."journal_accounts" DROP CONSTRAINT "journal_account_composite_pk";
--> statement-breakpoint
ALTER TABLE "spendwise"."journal_accounts" ADD CONSTRAINT "journal_account_composite_pk" PRIMARY KEY("account_id","journal_id");--> statement-breakpoint
ALTER TABLE "spendwise"."tags" DROP CONSTRAINT "tags_pkey";
--> statement-breakpoint
ALTER TABLE "spendwise"."tags" ADD CONSTRAINT "tags_pkey" PRIMARY KEY("id","journal_id");
