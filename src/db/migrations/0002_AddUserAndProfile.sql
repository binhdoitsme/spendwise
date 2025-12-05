CREATE TABLE "spendwise"."profiles" (
	"userId" text PRIMARY KEY NOT NULL,
	"firstName" varchar(100) NOT NULL,
	"lastName" varchar(100) NOT NULL,
	"gender" varchar(10) NOT NULL,
	"dob" date NOT NULL,
	"nationality" varchar(100) NOT NULL,
	"avatarUrl" text
);
--> statement-breakpoint
CREATE TABLE "spendwise"."users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" text NOT NULL,
	"createdAt" date NOT NULL
);
