import { AccountId } from "@/modules/shared/domain/identifiers";

export interface AccountBasic {
  id: AccountId;
  displayName: string;
  type: string;
  statementDay: number;
}

export abstract class JournalAccountResolver {
  abstract resolveOne(id: AccountId): Promise<AccountBasic | undefined>;
  abstract resolveMany(ids: AccountId[]): Promise<AccountBasic[]>;
}
