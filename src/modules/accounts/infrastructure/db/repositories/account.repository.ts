import { AccountId, UserId } from "@/modules/shared/domain/identifiers";
import { ListingOptions } from "@/modules/shared/domain/specs";
import { and, asc, desc, eq, inArray, SQL } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Account, AccountType } from "../../../domain/account";
import { AccountRepository } from "../../../domain/repositories";
import * as schema from "../schemas";
import { accounts, mapAccountFromDomain, mapAccountToDomain } from "../schemas";

export class DrizzleAccountRepository implements AccountRepository {
  constructor(private readonly dbInstance: NodePgDatabase<typeof schema>) {}

  async findById(id: AccountId): Promise<Account | undefined> {
    return await this.dbInstance.query.accounts
      .findFirst({
        where: eq(accounts.id, id.value),
      })
      .then((result) => (result ? mapAccountToDomain(result) : undefined));
  }

  async findAllByIds(ids: AccountId[]): Promise<Account[]> {
    return await this.dbInstance.query.accounts
      .findMany({
        where: inArray(
          accounts.id,
          ids.map((id) => id.value)
        ),
      })
      .then((result) => result.map((account) => mapAccountToDomain(account)));
  }

  private buildLimitOffset(options?: ListingOptions): {
    limit?: number;
    offset?: number;
    orderBy?: SQL<unknown>[];
  } {
    if (!options) {
      return {};
    }
    return {
      limit: options?.limit,
      offset: options?.offset,
      orderBy: options?.orderBy
        ? [
            (options.orderDesc ? desc : asc)(
              accounts[
                options.orderBy as keyof typeof schema.accounts.$inferSelect
              ]
            ),
          ]
        : undefined,
    };
  }

  async findByUserId(
    userId: UserId,
    options?: ListingOptions
  ): Promise<Account[]> {
    const result = await this.dbInstance.query.accounts.findMany({
      where: eq(accounts.userId, userId.value),
      ...this.buildLimitOffset(options),
    });
    return result
      .filter(Boolean)
      .map((account) => mapAccountToDomain(account)!);
  }

  async findByType(
    userId: UserId,
    type: AccountType,
    options?: ListingOptions
  ): Promise<Account[]> {
    const result = await this.dbInstance.query.accounts.findMany({
      where: and(eq(accounts.userId, userId.value), eq(accounts.type, type)),
      ...this.buildLimitOffset(options),
    });
    return result
      .filter(Boolean)
      .map((account) => mapAccountToDomain(account)!);
  }

  async save(account: Account): Promise<void> {
    await this.dbInstance
      .insert(accounts)
      .values(mapAccountFromDomain(account))
      .onConflictDoUpdate({
        target: accounts.id,
        set: {
          name: account.name,
        },
      });
  }

  async delete(id: AccountId): Promise<void> {
    await this.dbInstance.delete(accounts).where(eq(accounts.id, id.value));
  }
}
