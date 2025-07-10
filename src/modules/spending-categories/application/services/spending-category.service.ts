import { JournalId } from "@/modules/journals/domain/journal";
import { SpendingCategoryId } from "@/modules/shared/domain/identifiers";
import { ISOCurrency } from "@/modules/shared/presentation/currencies";
import { SpendingCategoryRepository } from "../../domain/repositories";
import {
  SpendingCategory,
  SpendingCategoryType,
} from "../../domain/spending-category";
import { mapToSpendingCategoryDto } from "../dto/dtos.types";

export class SpendingCategoryServices {
  constructor(
    private readonly spendingCategoryRepository: SpendingCategoryRepository
  ) {}

  async getSpendingCategoriesByJournal(journalId: string) {
    const spendingCategories =
      await this.spendingCategoryRepository.findByJournal(
        new JournalId(journalId)
      );
    return {
      spendingCategories: spendingCategories.map(mapToSpendingCategoryDto),
    };
  }

  async addSpendingCategory(
    journalId: string,
    name: string,
    limit: number,
    currency: string
  ) {
    const spendingCategory = SpendingCategory.new(
      new JournalId(journalId),
      name,
      SpendingCategoryType.Monthly,
      {
        amount: limit,
        currency: currency as ISOCurrency,
      }
    );

    await this.spendingCategoryRepository.save(spendingCategory);

    return {
      id: spendingCategory.id.value,
    };
  }

  async deleteSpendingCategory(spendingCategoryId: string) {
    const spendingCategory = await this.spendingCategoryRepository.findById(
      new SpendingCategoryId(spendingCategoryId)
    );
    if (!spendingCategory) {
      throw new Error("Spending category not found");
    }
    await this.spendingCategoryRepository.deleteById(spendingCategory.id);
  }
}
