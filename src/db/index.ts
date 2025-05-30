"use node";
import { Pool } from "pg";

let pool: Pool | null = null;

export function getDbConnectionPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL, // Ensure this environment variable is set
    });
  }
  return pool;
}
