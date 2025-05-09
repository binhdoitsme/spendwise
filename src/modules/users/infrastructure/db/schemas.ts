import { pgTable, text, varchar, date } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text().primaryKey(),
  email: varchar({ length: 255 }).notNull(),
  password: text().notNull(),
  createdAt: date({ mode: "date" }).notNull(),
});

export const profiles = pgTable("profiles", {
  userId: text().primaryKey(),
  firstName: varchar({ length: 100 }).notNull(),
  lastName: varchar({ length: 100 }).notNull(),
  gender: varchar({ length: 10 }).notNull(),
  dob: date({ mode: "date" }).notNull(),
  nationality: varchar({ length: 100 }).notNull(),
  avatarUrl: text(),
});
