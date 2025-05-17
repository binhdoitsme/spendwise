import { dbConnectionPool } from "@/db";
import * as schema from "@/modules/journals/infrastructure/db/schemas";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { provideUserRepository } from "../users/users.module";
import { JournalServices } from "./application/services/journal.service";
import { DrizzleJournalRepository } from "./infrastructure/db/repositories/journal.repository";
import { DrizzleTransactionRepository } from "./infrastructure/db/repositories/transaction.repository";
import { DrizzleJournalUserResolver } from "./infrastructure/external/user-resolver";
import { DrizzleJournalAccountResolver } from "./infrastructure/external/account-resolver";
import { provideAccountRepository } from "../accounts/account.module";

export function provideJournalServices(
  connectionPool: Pool = dbConnectionPool
): JournalServices {
  const dbInstance = drizzle(connectionPool, { schema });
  const journalRepository = new DrizzleJournalRepository(dbInstance);
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
