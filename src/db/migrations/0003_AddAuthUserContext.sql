CREATE TABLE "refresh_token" (
	"id" text PRIMARY KEY NOT NULL,
	"token" varchar(128) NOT NULL,
	"expiration" timestamp NOT NULL,
	"isRevoked" boolean DEFAULT false NOT NULL,
	"userId" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	CONSTRAINT "refresh_token_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE VIEW "auth_users" AS (SELECT id, email, password FROM users);
