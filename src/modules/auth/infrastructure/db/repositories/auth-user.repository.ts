import { AuthUser } from "@/modules/auth/domain/auth-user";
import { AuthUserRepository } from "@/modules/auth/domain/repositories";
import { UserId } from "@/modules/shared/domain/identifiers";
import { Email, Password } from "@/modules/shared/domain/value-objects";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../schemas";
import { authUsers } from "../schemas";

export class DrizzleAuthUserRepository implements AuthUserRepository {
  constructor(private readonly dbInstance: NodePgDatabase<typeof schema>) {}

  async findByEmail(email: Email): Promise<AuthUser | undefined> {
    const userResult = await this.dbInstance
      .select()
      .from(authUsers)
      .where(eq(authUsers.email, email.toString()))
      .limit(1);

    if (!userResult[0]) return undefined;

    return this.mapToDomain(userResult[0]);
  }

  async findById(id: UserId): Promise<AuthUser | undefined> {
    const userResult = await this.dbInstance
      .select()
      .from(authUsers)
      .where(eq(authUsers.id, id.value))
      .limit(1);

    if (!userResult[0]) return undefined;

    return this.mapToDomain(userResult[0]);
  }

  private mapToDomain(userSchema: typeof authUsers.$inferSelect): AuthUser {
    return new AuthUser(
      new UserId(userSchema.id),
      Email.from(userSchema.email),
      new Password(userSchema.password)
    );
  }
}
