import { JournalId } from "@/modules/journals/domain/journal";
import { SpendingCategoryId } from "@/modules/shared/domain/identifiers";
import { SpendingCategoryRepository } from "@/modules/spending-categories/domain/repositories";
import { SpendingCategory } from "@/modules/spending-categories/domain/spending-category";
import { eq, sql } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { mapSpendingCategoryToDomain } from "../mappers";
import * as schema from "../schemas";

export class DrizzleSpendingCategoryRepository
  implements SpendingCategoryRepository
{
  constructor(private readonly dbInstance: NodePgDatabase<typeof schema>) {}

  async findById(
    id: SpendingCategoryId
  ): Promise<SpendingCategory | undefined> {
    const spendingCategorySchema =
      await this.dbInstance.query.spendingCategories.findFirst({
        where: eq(schema.spendingCategories.id, id.value),
      });
    const spentAmounts = await this.dbInstance
      .select()
      .from(schema.spendingCategorySpentAmounts)
      .where(eq(schema.spendingCategorySpentAmounts.categoryId, id.value));
    return spendingCategorySchema
      ? mapSpendingCategoryToDomain(spendingCategorySchema, spentAmounts)
      : undefined;
  }

  async findByJournal(journalId: JournalId): Promise<SpendingCategory[]> {
    const spendingCategories =
      await this.dbInstance.query.spendingCategories.findMany({
        where: eq(schema.spendingCategories.journalId, journalId.value),
      });
    return await Promise.all(
      spendingCategories.map(async (spendingCategorySchema) => {
        const spentAmounts = await this.dbInstance
          .select()
          .from(schema.spendingCategorySpentAmounts)
          .where(
            eq(
              schema.spendingCategorySpentAmounts.categoryId,
              spendingCategorySchema.id
            )
          );
        return mapSpendingCategoryToDomain(
          spendingCategorySchema,
          spentAmounts
        );
      })
    );
  }

  async save(spendingLimit: SpendingCategory): Promise<void> {
    // Upsert logic for saving spending category
    await this.dbInstance
      .insert(schema.spendingCategories)
      .values({
        id: spendingLimit.id.value,
        journalId: spendingLimit.journalId.value,
        name: spendingLimit.name,
        type: spendingLimit.type,
        limit: spendingLimit.limit.amount,
        currency: spendingLimit.limit.currency,
        createdAt: spendingLimit.createdAt.toJSDate(),
        updatedAt: spendingLimit.updatedAt.toJSDate(),
      })
      .onConflictDoUpdate({
        target: schema.spendingCategories.id,
        set: {
          name: spendingLimit.name,
          type: spendingLimit.type,
          limit: spendingLimit.limit.amount,
          currency: spendingLimit.limit.currency,
          updatedAt: spendingLimit.updatedAt.toJSDate(),
        },
      });
  }

  async deleteById(id: SpendingCategoryId): Promise<void> {
    const spendingCategory = await this.findById(id);
    if (!spendingCategory) {
      throw new Error("Spending category not found");
    }
    const transactionTable = pgTable("transactions", {
      categoryId: text("category_id"),
    });
    const journalTable = pgTable("journals", {
      id: text("id").primaryKey(),
      updatedAt: timestamp("updated_at", { mode: "date" }),
    });
    await this.dbInstance.transaction(async (tx) => {
      await tx
        .delete(schema.spendingCategories)
        .where(eq(schema.spendingCategories.id, id.value));
      await tx
        .update(transactionTable)
        .set({ categoryId: null })
        .where(eq(transactionTable.categoryId, id.value));
      await tx
        .update(journalTable)
        .set({ updatedAt: sql`(CURRENT_TIMESTAMP AT TIME ZONE 'UTC')` })
        .where(eq(journalTable.id, spendingCategory.journalId.value));
    });
  }
}
