import { dbConnectionPool } from "@/db";
import * as schema from "@/modules/journals/infrastructure/db/schemas";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { provideAccountRepository } from "../accounts/account.module";
import { provideUserRepository } from "../users/users.module";
import { JournalServices } from "./application/services/journal.service";
import { DrizzleJournalRepository } from "./infrastructure/db/repositories/journal.repository";
import { DrizzleTransactionRepository } from "./infrastructure/db/repositories/transaction.repository";
import { DrizzleJournalAccountResolver } from "./infrastructure/external/account-resolver";
import { DrizzleJournalUserResolver } from "./infrastructure/external/user-resolver";

export function provideJournalServices(
  connectionPool: Pool = dbConnectionPool
): JournalServices {
  const dbInstance = drizzle(connectionPool, { schema });
  const journalRepository = provideJournalRepository(connectionPool);
  const transactionRepository = new DrizzleTransactionRepository(dbInstance);
  const userResolver = new DrizzleJournalUserResolver(
    provideUserRepository(connectionPool)
  );
  const accountResolver = new DrizzleJournalAccountResolver(
    provideAccountRepository(connectionPool)
  );
  return new JournalServices(
    journalRepository,
    transactionRepository,
    userResolver,
    accountResolver
  );
}

export function provideJournalRepository(connectionPool: Pool) {
  const dbInstance = drizzle(connectionPool, { schema });
  return new DrizzleJournalRepository(dbInstance);
}
