import { AccountId, UserId } from "@/modules/shared/domain/identifiers";
import { Account, AccountType } from "./account";
import { ListingOptions } from "@/modules/shared/domain/specs";

export abstract class AccountRepository {
  abstract findByUserId(
    userId: UserId,
    options?: ListingOptions
  ): Promise<Account[]>;
  abstract findById(id: AccountId): Promise<Account | undefined>;
  abstract findAllByIds(ids: AccountId[]): Promise<Account[]>;
  abstract findByType(
    userId: UserId,
    type: AccountType,
    options?: ListingOptions
  ): Promise<Account[]>;
  abstract save(account: Account): Promise<void>;
  abstract delete(id: AccountId): Promise<void>;
}
