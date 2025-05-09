import { dbConnectionPool } from "@/db";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { BcryptPasswordHasher } from "../shared/infrastructure/password-hasher";
import { AuthServices } from "./application/services/auth.service";
import { DrizzleAuthUserRepository } from "./infrastructure/db/repositories/auth-user.repository";
import { DrizzleRefreshTokenRepository } from "./infrastructure/db/repositories/refresh-token.repository";
import * as schema from "./infrastructure/db/schemas";
import { JwtTokenHandler } from "./infrastructure/external/jwt-token-handler";

export function provideAuthServices(
  connectionPool: Pool = dbConnectionPool
): AuthServices {
  const dbInstance = drizzle(connectionPool, { schema });
  const userRepository = new DrizzleAuthUserRepository(dbInstance);
  const refreshTokenRepository = new DrizzleRefreshTokenRepository(dbInstance);
  const passwordHasher = new BcryptPasswordHasher();
  const tokenHandler = new JwtTokenHandler(
    process.env.JWT_SECRET_KEY!,
    process.env.JWT_EXPIRES_IN!
  );
  return new AuthServices(
    userRepository,
    refreshTokenRepository,
    passwordHasher,
    tokenHandler
  );
}
