import { dbConnectionPool } from "@/db";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { provideUserRepository } from "../users/users.module";
import { AccountService } from "./application/services/account.service";
import { DrizzleAccountRepository } from "./infrastructure/db/repositories/account.repository";
import * as schema from "./infrastructure/db/schemas";
import { DrizzleAccountUserResolver } from "./infrastructure/external/user-resolver";

export function provideAccountRepository(connectionPool: Pool) {
  const dbInstance = drizzle(connectionPool, { schema });
  return new DrizzleAccountRepository(dbInstance);
}

export function provideAccountServices(
  connectionPool: Pool = dbConnectionPool
) {
  const accountRepository = provideAccountRepository(connectionPool);
  const userRepository = provideUserRepository(connectionPool);
  const userResolver = new DrizzleAccountUserResolver(userRepository);
  return new AccountService(accountRepository, userResolver);
}
