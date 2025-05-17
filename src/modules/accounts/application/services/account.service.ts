import { formatError } from "@/modules/shared/base/errors";
import { AccountId, UserId } from "@/modules/shared/domain/identifiers";
import { DateTime } from "luxon";
import { Account, AccountType } from "../../domain/account";
import { accountErrors } from "../../domain/errors";
import { AccountRepository } from "../../domain/repositories";
import { AccountUserResolver } from "../contracts/user-resolver";
import {
  AccountBasicDto,
  AccountDetailedDto,
  AccountInput,
} from "../dto/dtos.types";
import { mapAccountToBasicDto } from "../dto/mappers";
import { sampleAccounts } from "../dto/samples";

export class AccountService {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly userResolver: AccountUserResolver
  ) {}

  async getAccounts(userId: string): Promise<AccountBasicDto[]> {
    const result = await this.accountRepository.findByUserId(
      new UserId(userId)
    );
    const user = await this.userResolver.resolveOne(new UserId(userId));
    return result.map((account) => mapAccountToBasicDto(account, user!));
  }

  // eslint-disable-next-line
  async getAccount(id: string): Promise<AccountDetailedDto | undefined> {
    return sampleAccounts[0];
    // return this.accountRepository.findById(id);
  }

  async createAccount(input: AccountInput): Promise<{ id: string }> {
    const userId = new UserId(input.userId);
    let account: Account;
    switch (input.type) {
      case "cash":
        // one cash account per user
        const existing = await this.accountRepository.findByType(
          userId,
          AccountType.CASH,
          { limit: 1 }
        );
        if (existing.length) {
          throw accountErrors.alreadyHadCashAccount;
        }
        account = Account.cash(input.name, userId);
        break;
      case "debit":
        account = Account.debit(
          input.name,
          input.bankName,
          input.last4,
          userId
        );
        break;
      case "credit":
        account = Account.credit(
          input.name,
          input.bankName,
          input.last4,
          input.statementDay,
          input.gracePeriodInDays,
          DateTime.fromJSDate(input.expiration),
          userId
        );
        break;
      case "loan":
        account = Account.loan(
          input.name,
          input.bankName,
          DateTime.fromJSDate(input.loanStartDate),
          DateTime.fromJSDate(input.loanEndDate),
          input.originalAmount,
          userId
        );
      default:
        throw formatError(accountErrors.invalidAccountType, {
          accountType: input.type,
        });
    }
    await this.accountRepository.save(account);
    return { id: account.id.value };
  }

  async deleteAccount(id: string): Promise<void> {
    return this.accountRepository.delete(new AccountId(id));
  }
}
