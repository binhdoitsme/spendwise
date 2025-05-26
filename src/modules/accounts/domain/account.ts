import { AccountId, UserId } from "@/modules/shared/domain/identifiers";
import { DateTime } from "luxon";

export enum AccountType {
  CASH = "cash",
  DEBIT = "debit",
  CREDIT = "credit",
  LOAN = "loan",
}

export type CashAccountData = object & {};

export interface DebitAccountData {
  bankName: string;
  last4: string;
}

export interface CreditAccountData {
  bankName: string;
  last4: string;
  statementDay: number; // 1–28
  gracePeriodInDays: number;
  expiration: DateTime;
  limit?: number;
}

export interface LoanAccountData {
  bankName: string;
  loanStartDate: DateTime;
  loanEndDate: DateTime;
  originalAmount: number;
}

export type AccountData = {
  [AccountType.CASH]: CashAccountData;
  [AccountType.DEBIT]: DebitAccountData;
  [AccountType.CREDIT]: CreditAccountData;
  [AccountType.LOAN]: LoanAccountData;
};

export interface BillingCycle {
  start: DateTime;
  end: DateTime;
  due: DateTime;
}

export abstract class AccountBehavior<T extends AccountType = AccountType> {
  abstract getDisplayName(account: Account<T>): string;
  abstract getBillingCycle(
    account: Account<T>,
    date: DateTime
  ): BillingCycle | null;
}

export class Account<T extends AccountType = AccountType> {
  private constructor(
    readonly id: AccountId,
    readonly type: T,
    readonly name: string,
    private _isActive: boolean,
    readonly data: AccountData[T],
    readonly userId: UserId,
    readonly createdAt: DateTime,
    private readonly behavior: AccountBehavior = AccountBehaviors.ofType(type)
  ) {}

  getDisplayName(): string {
    return this.behavior.getDisplayName(this);
  }

  getBillingCycle(date: DateTime): BillingCycle | null {
    return this.behavior.getBillingCycle(this, date);
  }

  get isActive(): boolean {
    return this._isActive;
  }

  isCreditOrLoan() {
    return this.type === "credit" || this.type === "loan";
  }

  deactivate() {
    this._isActive = false;
  }

  activate() {
    this._isActive = true;
  }

  static cash(
    name: string,
    userId: UserId,
    id: AccountId = new AccountId(),
    isActive = true,
    createdAt: DateTime = DateTime.utc()
  ): Account<AccountType.CASH> {
    if (!name.trim()) {
      throw new Error("Cash account name is required.");
    }
    return new Account(
      id,
      AccountType.CASH,
      name,
      isActive,
      {},
      userId,
      createdAt
    );
  }

  static debit(
    name: string,
    bankName: string,
    last4: string,
    userId: UserId,
    id: AccountId = new AccountId(),
    isActive = true,
    createdAt: DateTime = DateTime.utc()
  ): Account<AccountType.DEBIT> {
    if (!name.trim()) {
      throw new Error("Debit account name is required.");
    }
    if (!bankName.trim()) {
      throw new Error("Bank name is required.");
    }
    if (!/^\d{4}$/.test(last4)) {
      throw new Error("Last 4 digits must be a 4-digit number string.");
    }
    return new Account(
      id,
      AccountType.DEBIT,
      name,
      isActive,
      { bankName, last4 },
      userId,
      createdAt
    );
  }

  static credit(
    name: string,
    bankName: string,
    last4: string,
    statementDay: number,
    gracePeriodInDays: number,
    expiration: DateTime,
    userId: UserId,
    limit?: number,
    id: AccountId = new AccountId(),
    isActive = true,
    createdAt: DateTime = DateTime.utc()
  ): Account<AccountType.CREDIT> {
    if (!name.trim()) {
      throw new Error("Credit account name is required.");
    }
    if (!bankName.trim()) {
      throw new Error("Bank name is required.");
    }
    if (!/^\d{4}$/.test(last4)) {
      throw new Error("Last 4 digits must be a 4-digit number string.");
    }
    if (statementDay < 1 || statementDay > 28) {
      throw new Error("Statement day must be between 1 and 28.");
    }
    if (gracePeriodInDays <= 0) {
      throw new Error("Grace period must be a positive number.");
    }
    if (limit !== undefined && limit < 0) {
      throw new Error("Credit limit must be non-negative.");
    }

    return new Account(
      id,
      AccountType.CREDIT,
      name,
      isActive,
      {
        bankName,
        last4,
        statementDay,
        gracePeriodInDays,
        expiration: expiration.endOf("month"),
        limit,
      },
      userId,
      createdAt
    );
  }

  static loan(
    name: string,
    bankName: string,
    loanStartDate: DateTime,
    loanEndDate: DateTime,
    originalAmount: number,
    userId: UserId,
    id: AccountId = new AccountId(),
    isActive = true,
    createdAt: DateTime = DateTime.utc()
  ): Account<AccountType.LOAN> {
    if (!name.trim()) {
      throw new Error("Loan account name is required.");
    }
    if (!bankName.trim()) {
      throw new Error("Bank name is required.");
    }
    if (!loanStartDate.isValid) {
      throw new Error("Loan start date must be valid.");
    }
    if (!loanEndDate.isValid) {
      throw new Error("Loan end date must be valid.");
    }
    if (loanEndDate <= loanStartDate) {
      throw new Error("Loan end date must be after the start date.");
    }
    if (originalAmount <= 0) {
      throw new Error("Original loan amount must be greater than 0.");
    }

    return new Account(
      id,
      AccountType.LOAN,
      name,
      isActive,
      {
        bankName,
        loanStartDate,
        loanEndDate,
        originalAmount,
      },
      userId,
      createdAt
    );
  }
}

class CashAccountBehavior implements AccountBehavior<AccountType.CASH> {
  getDisplayName(account: Account): string {
    return `${account.name}`;
  }

  getBillingCycle(): null {
    return null; // Cash accounts typically do not have billing cycles
  }
}

class DebitAccountBehavior implements AccountBehavior<AccountType.DEBIT> {
  getDisplayName(account: Account<AccountType.DEBIT>): string {
    return `${account.name} (**** ${account.data.last4})`;
  }

  getBillingCycle(): null {
    return null; // Debit accounts typically do not have billing cycles
  }
}

class LoanAccountBehavior implements AccountBehavior<AccountType.LOAN> {
  getDisplayName(account: Account<AccountType.LOAN>): string {
    return `${account.name}`;
  }

  getBillingCycle(
    account: Account<AccountType.LOAN>,
    date: DateTime
  ): BillingCycle | null {
    const { loanStartDate, loanEndDate } = account.data;
    if (
      date.startOf("day") > loanEndDate ||
      date.startOf("day") < loanStartDate
    ) {
      return null;
    }
    return { start: loanStartDate, end: loanEndDate, due: loanEndDate };
  }
}

class CreditAccountBehavior implements AccountBehavior<AccountType.CREDIT> {
  getDisplayName(account: Account<AccountType.CREDIT>): string {
    return `${account.name} (**** ${account.data.last4})`;
  }

  getBillingCycle(
    account: Account<AccountType.CREDIT>,
    date: DateTime
  ): BillingCycle {
    const { statementDay, gracePeriodInDays } = account.data;

    const end =
      date.day >= statementDay
        ? date.set({ day: statementDay }).endOf("day")
        : date.minus({ months: 1 }).set({ day: statementDay }).endOf("day");

    const start = end.minus({ months: 1 }).plus({ days: 1 }).startOf("day");
    const due = end.plus({ days: gracePeriodInDays }).endOf("day");

    return { start, end, due };
  }
}

class AccountBehaviors {
  static ofType(type: AccountType): AccountBehavior {
    switch (type) {
      case AccountType.CREDIT:
        return new CreditAccountBehavior();
      case AccountType.CASH:
        return new CashAccountBehavior();
      case AccountType.DEBIT:
        return new DebitAccountBehavior();
      case AccountType.LOAN:
        return new LoanAccountBehavior();
      default:
        throw Error("Unsupported account type");
    }
  }
}
