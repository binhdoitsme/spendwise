import { AccountId } from "@/modules/shared/domain/identifiers";
import {
  AccountBasic,
  JournalAccountResolver,
} from "../../application/contracts/account-resolver";
import { AccountRepository } from "@/modules/accounts/domain/repositories";
import {
  AccountType,
  CreditAccountData,
} from "@/modules/accounts/domain/account";

export class DrizzleJournalAccountResolver implements JournalAccountResolver {
  constructor(private readonly accountRepository: AccountRepository) {}

  async resolveOne(id: AccountId): Promise<AccountBasic | undefined> {
    const account = await this.accountRepository.findById(id);
    if (!account) {
      return undefined;
    }
    return {
      id,
      displayName: account.getDisplayName(),
      type: account.type,
      statementDay:
        account.type === AccountType.CREDIT
          ? (account.data as CreditAccountData).statementDay
          : 1,
    };
  }

  async resolveMany(ids: AccountId[]): Promise<AccountBasic[]> {
    const accounts = await this.accountRepository.findAllByIds(ids);
    return accounts.map((account) => ({
      id: account.id,
      displayName: account.getDisplayName(),
      type: account.type,
      statementDay:
        account.type === AccountType.CREDIT
          ? (account.data as CreditAccountData).statementDay
          : 1,
    }));
  }
}
