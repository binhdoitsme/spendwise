import { date, pgTable, text, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  password: text("password").notNull(),
  createdAt: date("created_at", { mode: "date" }).notNull(),
});

export const profiles = pgTable("profiles", {
  userId: text("user_id").primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  gender: varchar("gender", { length: 10 }).notNull(),
  dob: date("dob", { mode: "date" }).notNull(),
  nationality: varchar("nationality", { length: 100 }).notNull(),
  avatarUrl: text("avatar_url"),
});
