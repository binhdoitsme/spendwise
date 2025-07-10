import { JournalId } from "@/modules/journals/domain/journal";
import { SpendingCategoryId } from "@/modules/shared/domain/identifiers";
import { MoneyAmount } from "@/modules/shared/presentation/currencies";
import { DateTime } from "luxon";

export enum SpendingCategoryType {
  Daily = "daily",
  Weekly = "weekly",
  Monthly = "monthly",
  Yearly = "yearly",
}

export class SpendingCategory {
  private constructor(
    public readonly id: SpendingCategoryId,
    public readonly journalId: JournalId,
    public readonly name: string,
    public limit: MoneyAmount,
    public monthlySpent: Map<string, MoneyAmount> = new Map(),
    public readonly type: SpendingCategoryType = SpendingCategoryType.Monthly,
    public readonly createdAt: DateTime = DateTime.utc(),
    public updatedAt: DateTime = DateTime.utc()
  ) {}

  public updateLimit(limit: MoneyAmount): void {
    this.limit = limit;
    this.updatedAt = DateTime.utc();
  }

  public addSpent(month: string, spent: MoneyAmount): void {
    if (spent.currency !== this.limit.currency) {
      throw new Error(
        "Current amount and limit amount must have the same currency"
      );
    }
    const currentSpent = this.monthlySpent.get(month) || {
      amount: 0,
      currency: spent.currency,
    };
    const newSpent = {
      amount: currentSpent.amount + spent.amount,
      currency: spent.currency,
    };
    this.monthlySpent.set(month, newSpent);
    this.updatedAt = DateTime.utc();
  }

  public isExceeded(spent: MoneyAmount): boolean {
    if (spent.currency !== this.limit.currency) {
      throw new Error(
        "Current amount and limit amount must have the same currency"
      );
    }
    return spent.amount > this.limit.amount;
  }

  public static restore({
    id,
    journalId,
    name,
    limit,
    type,
    monthlySpent = new Map(),
    createdAt,
    updatedAt,
  }: {
    id: SpendingCategoryId;
    journalId: JournalId;
    name: string;
    limit: MoneyAmount;
    type: SpendingCategoryType;
    monthlySpent?: Map<string, MoneyAmount>;
    createdAt: DateTime;
    updatedAt: DateTime;
  }): SpendingCategory {
    return new SpendingCategory(
      id,
      journalId,
      name,
      limit,
      monthlySpent,
      type,
      createdAt,
      updatedAt
    );
  }

  public static new(
    journalId: JournalId,
    name: string,
    type: SpendingCategoryType,
    limit: MoneyAmount
  ): SpendingCategory {
    return new SpendingCategory(
      new SpendingCategoryId(),
      journalId,
      name,
      limit,
      new Map(),
      type,
      DateTime.utc(),
      DateTime.utc()
    );
  }
}
