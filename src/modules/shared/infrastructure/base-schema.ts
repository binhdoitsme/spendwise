import { pgSchema } from "drizzle-orm/pg-core";

export const baseSchema = pgSchema(process.env.BASE_SCHEMA ?? "spendwise");
