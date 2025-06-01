import { getDbConnectionPool } from "@/db";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { BcryptPasswordHasher } from "../shared/infrastructure/password-hasher";
import { UserServices } from "./application/services/user.service";
import { DrizzleUserRepository } from "./infrastructure/db/repositories/user.repository";
import * as schema from "./infrastructure/db/schemas";

export function provideUserRepository(connectionPool: Pool) {
  const dbInstance = drizzle(connectionPool, { schema });
  return new DrizzleUserRepository(dbInstance);
}

export function provideUserServices(
  connectionPool: Pool = getDbConnectionPool()
) {
  const userRepository = provideUserRepository(connectionPool);
  const passwordHasher = new BcryptPasswordHasher();
  return new UserServices(userRepository, passwordHasher);
}
