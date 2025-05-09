import { dbConnectionPool } from "@/db";
import { Pool } from "pg";
import { UserServices } from "./application/services/user.service";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./infrastructure/db/schemas";
import { DrizzleUserRepository } from "./infrastructure/db/repositories/user.repository";
import { BcryptPasswordHasher } from "../shared/infrastructure/password-hasher";

export function provideUserServices(connectionPool: Pool = dbConnectionPool) {
  const dbInstance = drizzle(connectionPool, { schema });
  const userRepository = new DrizzleUserRepository(dbInstance);
  const passwordHasher = new BcryptPasswordHasher();
  return new UserServices(userRepository, passwordHasher);
}
