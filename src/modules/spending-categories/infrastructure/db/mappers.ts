import { JournalId } from "@/modules/journals/domain/journal";
import { SpendingCategoryId } from "@/modules/shared/domain/identifiers";
import { ISOCurrency } from "@/modules/shared/presentation/currencies";
import { DateTime } from "luxon";
import {
  SpendingCategory,
  SpendingCategoryType,
} from "../../domain/spending-category";
import { spendingCategories, spendingCategorySpentAmounts } from "./schemas";

export function mapSpendingCategoryToDomain(
  spendingCategorySchema: typeof spendingCategories.$inferSelect,
  monthlySpent: (typeof spendingCategorySpentAmounts.$inferSelect)[] = []
): SpendingCategory {
  return SpendingCategory.restore({
    id: new SpendingCategoryId(spendingCategorySchema.id),
    journalId: new JournalId(spendingCategorySchema.journalId),
    name: spendingCategorySchema.name,
    type: spendingCategorySchema.type as SpendingCategoryType,
    limit: {
      amount: spendingCategorySchema.limit,
      currency: spendingCategorySchema.currency as ISOCurrency,
    },
    monthlySpent: new Map(
      monthlySpent.map((spent) => [
        DateTime.fromJSDate(spent.month, { zone: "utc" }).toFormat("yyyyMM"),
        {
          amount: spent.spent,
          currency: spendingCategorySchema.currency as ISOCurrency,
        },
      ])
    ),
    createdAt: DateTime.fromJSDate(spendingCategorySchema.createdAt, {
      zone: "utc",
    }),
    updatedAt: DateTime.fromJSDate(spendingCategorySchema.updatedAt!, {
      zone: "utc",
    }),
  });
}
