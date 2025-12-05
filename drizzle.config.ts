import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./src/db/migrations",
  schema: ["./src/**/schemas.ts"],
  casing: "snake_case",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    schema: process.env.BASE_SCHEMA ?? "spendwise",
  },
});
