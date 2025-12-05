import { baseSchema } from "@/modules/shared/infrastructure/base-schema";
import { sql } from "drizzle-orm";
import {
  boolean,
  text,
  timestamp,
  varchar
} from "drizzle-orm/pg-core";

export const authUsers = baseSchema
  .view("auth_users", {
    id: text().notNull(),
    email: varchar({ length: 255 }).notNull(),
    password: text().notNull(),
  })
  .as(sql`SELECT id, email, password FROM users`);

export const refreshTokens = baseSchema.table("refresh_token", {
  id: text("id").primaryKey(),
  token: varchar("token", { length: 128 }).unique().notNull(),
  expiration: timestamp("expiration").notNull(),
  isRevoked: boolean("is_revoked").default(false).notNull(),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").notNull(),
});
