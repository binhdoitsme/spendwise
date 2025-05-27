import { AccountId } from "@/modules/shared/domain/identifiers";

export interface AccountBasic {
  id: AccountId;
  displayName: string;
  type: string;
}

export abstract class AccountResolver {
  abstract resolveOne(id: AccountId): Promise<AccountBasic | undefined>;
  abstract resolveMany(ids: AccountId[]): Promise<AccountBasic[]>;
}
