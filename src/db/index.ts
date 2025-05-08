"use node";
import { Pool } from "pg";

export const dbConnectionPool = new Pool({
  connectionString: process.env.DATABASE_URL, // Ensure this environment variable is set
});
