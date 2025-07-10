import { JournalId } from "@/modules/journals/domain/journal";
import { SpendingCategoryId } from "@/modules/shared/domain/identifiers";
import { SpendingCategory } from "./spending-category";

export abstract class SpendingCategoryRepository {
  abstract findByJournal(journalId: JournalId): Promise<SpendingCategory[]>;
  abstract findById(
    id: SpendingCategoryId
  ): Promise<SpendingCategory | undefined>;
  abstract save(spendingLimit: SpendingCategory): Promise<void>;
  abstract deleteById(id: SpendingCategoryId): Promise<void>;
}
