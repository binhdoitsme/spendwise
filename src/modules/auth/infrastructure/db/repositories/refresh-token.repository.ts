import {
  RefreshToken,
  RefreshTokenId,
} from "@/modules/auth/domain/refresh-token";
import { RefreshTokenRepository } from "@/modules/auth/domain/repositories";
import { UserId } from "@/modules/shared/domain/identifiers";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DateTime } from "luxon";
import * as schema from "../schemas";
import { refreshTokens } from "../schemas";

export class DrizzleRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly dbInstance: NodePgDatabase<typeof schema>) {}

  async findById(id: RefreshTokenId): Promise<RefreshToken | undefined> {
    const tokenResult = await this.dbInstance
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.id, id.value))
      .limit(1);

    if (!tokenResult[0]) return undefined;

    return this.mapToDomain(tokenResult[0]);
  }

  async findByToken(token: string): Promise<RefreshToken | undefined> {
    const tokenResult = await this.dbInstance
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, token))
      .limit(1);

    if (!tokenResult[0]) return undefined;

    return this.mapToDomain(tokenResult[0]);
  }

  async save(token: RefreshToken): Promise<void> {
    await this.dbInstance.insert(refreshTokens).values({
      id: token.id.value,
      token: token.token,
      userId: token.userId.value,
      isRevoked: token.isRevoked,
      expiration: token.expiration.toJSDate(),
      createdAt: token.createdAt.toJSDate(),
    });
  }

  async delete(id: RefreshTokenId): Promise<void> {
    await this.dbInstance
      .delete(refreshTokens)
      .where(eq(refreshTokens.id, id.value));
  }

  private mapToDomain(
    tokenSchema: typeof refreshTokens.$inferSelect
  ): RefreshToken {
    return new RefreshToken(
      tokenSchema.token,
      DateTime.fromJSDate(tokenSchema.expiration),
      new UserId(tokenSchema.userId),
      new RefreshTokenId(tokenSchema.id),
      DateTime.fromJSDate(tokenSchema.createdAt),
      tokenSchema.isRevoked
    );
  }
}
