CREATE TYPE "spendwise"."journal_permissions" AS ENUM('owner', 'read', 'write');--> statement-breakpoint
CREATE TYPE "spendwise"."transaction_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'AUTO_APPROVED');--> statement-breakpoint
CREATE TYPE "spendwise"."transaction_types" AS ENUM('INCOME', 'EXPENSE', 'TRANSFER');--> statement-breakpoint
CREATE TABLE "spendwise"."collaborators" (
	"email" varchar(255) PRIMARY KEY NOT NULL,
	"permission" "journal_permissions" NOT NULL,
	"journalId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spendwise"."journal_accounts" (
	"accountId" text PRIMARY KEY NOT NULL,
	"journalId" text NOT NULL,
	"ownerId" text NOT NULL,
	"ownerEmail" varchar(255) NOT NULL,
	"gracePeriodDays" numeric,
	"createdAt" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spendwise"."journals" (
	"id" text PRIMARY KEY NOT NULL,
	"ownerId" text NOT NULL,
	"ownerEmail" varchar(255) NOT NULL,
	"title" varchar(200) NOT NULL,
	"requiresApproval" boolean DEFAULT false,
	"isArchived" boolean DEFAULT false,
	"createdAt" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spendwise"."tags" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"journalId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spendwise"."transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"journalId" text NOT NULL,
	"title" varchar(200) NOT NULL,
	"amount" numeric NOT NULL,
	"date" date NOT NULL,
	"account" varchar(100) NOT NULL,
	"type" "transaction_types" NOT NULL,
	"paidBy" varchar(255) NOT NULL,
	"tags" varchar[],
	"status" "transaction_status" NOT NULL,
	"notes" text,
	"paidOffTransaction" text,
	"relatedTransactions" text[]
);
