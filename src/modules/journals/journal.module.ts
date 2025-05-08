import { dbConnectionPool } from "@/db";
import * as schema from "@/modules/journals/infrastructure/db/schemas";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { JournalServices } from "./application/services/journal.service";
import { DrizzleJournalRepository } from "./infrastructure/db/repositories/journal.repository";
import { DrizzleTransactionRepository } from "./infrastructure/db/repositories/transaction.repository";
import { DrizzleUserResolver } from "./infrastructure/external/user-resolver";

export function provideJournalServices(
  connectionPool: Pool = dbConnectionPool
): JournalServices {
  const dbInstance = drizzle(connectionPool, { schema });
  const journalRepository = new DrizzleJournalRepository(dbInstance);
  const transactionRepository = new DrizzleTransactionRepository(dbInstance);
  const userResolver = new DrizzleUserResolver();
  return new JournalServices(
    journalRepository,
    transactionRepository,
    userResolver
  );
}
