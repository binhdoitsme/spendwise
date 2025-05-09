import { sql } from "drizzle-orm";
import {
  boolean,
  pgTable,
  pgView,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const authUsers = pgView("auth_users", {
  id: text().notNull(),
  email: varchar({ length: 255 }).notNull(),
  password: text().notNull(),
}).as(sql`SELECT id, email, password FROM users`);

export const refreshTokens = pgTable("refresh_token", {
  id: text().primaryKey(),
  token: varchar({ length: 128 }).unique().notNull(),
  expiration: timestamp().notNull(),
  isRevoked: boolean().default(false).notNull(),
  userId: text().notNull(),
  createdAt: timestamp().notNull(),
});
