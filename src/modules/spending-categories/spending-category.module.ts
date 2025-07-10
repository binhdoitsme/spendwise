import { getDbConnectionPool } from "@/db";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { SpendingCategoryServices } from "./application/services/spending-category.service";
import { DrizzleSpendingCategoryRepository } from "./infrastructure/db/repositories/spending-category.repository";
import * as schema from "./infrastructure/db/schemas";

export function provideSpendingCategoryServices(
  connectionPool: Pool = getDbConnectionPool()
) {
  const dbInstance = drizzle(connectionPool, { schema });
  const spendingCategoryRepository = new DrizzleSpendingCategoryRepository(
    dbInstance
  );
  return new SpendingCategoryServices(spendingCategoryRepository);
}
