import { AccountResolver, AccountBasic } from "../../application/contracts/account-resolver";
import { AccountRepository } from "@/modules/accounts/domain/repositories";
import { AccountId } from "@/modules/shared/domain/identifiers";

export class DrizzleReportAccountResolver implements AccountResolver {
  constructor(private readonly accountRepository: AccountRepository) {}

  async resolveOne(id: AccountId): Promise<AccountBasic | undefined> {
    const account = await this.accountRepository.findById(id);
    if (!account) return undefined;
    return {
      id,
      displayName: account.getDisplayName(),
      type: account.type,
    };
  }

  async resolveMany(ids: AccountId[]): Promise<AccountBasic[]> {
    const accounts = await this.accountRepository.findAllByIds(ids);
    return accounts.map((account) => ({
      id: account.id,
      displayName: account.getDisplayName(),
      type: account.type,
    }));
  }
}