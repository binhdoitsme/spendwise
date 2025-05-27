import { UserId } from "@/modules/shared/domain/identifiers";
import { ListingOptions } from "@/modules/shared/domain/specs";
import { and, asc, desc, eq, inArray, notInArray, or } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Journal, JournalId } from "../../../domain/journal";
import { JournalRepository } from "../../../domain/repositories";
import { RichJournal } from "../../../domain/rich-journal";
import {
  mapJournalFromDomain,
  mapJournalToDomain,
  mapTransactionToDomain,
} from "../mappers";
import * as schema from "../schemas";
import { collaborators, journalAccounts, journals, tags } from "../schemas";

export class DrizzleJournalRepository implements JournalRepository {
  constructor(private readonly dbInstance: NodePgDatabase<typeof schema>) {}

  async findById(journalId: JournalId): Promise<Journal | undefined> {
    const schema = await this.dbInstance.query.journals.findFirst({
      where: eq(journals.id, journalId.value),
      with: {
        accounts: true,
        collaborators: true,
        tags: true,
      },
    });
    return schema ? mapJournalToDomain(schema) : undefined;
  }

  async findByIdWithTransactions(
    journalId: JournalId,
    transactionOptions?: ListingOptions
  ): Promise<RichJournal | undefined> {
    // returning all transactions for brevity
    const journalSchema = await this.dbInstance.query.journals.findFirst({
      where: eq(journals.id, journalId.value),
      with: {
        transactions: {
          // limit: transactionOptions?.limit,
          // offset: transactionOptions?.offset,
          // orderBy: [
          //   (transactionOptions?.orderDesc ? desc : asc)(
          //     transactions[transactionOptions?.orderBy]
          //   ),
          // ],
        },
        accounts: true,
        collaborators: true,
        tags: true,
      },
    });
    const transactions = await this.dbInstance.query.transactions.findMany({
      limit: transactionOptions?.limit,
      offset: transactionOptions?.offset,
      orderBy: transactionOptions?.orderBy
        ? [
            (transactionOptions?.orderDesc ? desc : asc)(
              schema.transactions[
                transactionOptions.orderBy as keyof typeof schema.transactions.$inferSelect
              ]
            ),
          ]
        : undefined,
    });
    if (!journalSchema) {
      return undefined;
    }
    const journal = mapJournalToDomain(journalSchema);
    const transactionList = transactions
      .map((row) => mapTransactionToDomain(row))
      .filter(Boolean);
    return new RichJournal(journal, transactionList);
  }

  async findByUser(userId: UserId): Promise<Journal[]> {
    const rows = await this.dbInstance
      .selectDistinct({
        journalId: journals.id,
      })
      .from(journals)
      .leftJoin(collaborators, eq(journals.id, collaborators.journalId))
      .where(
        or(
          eq(journals.ownerId, userId.value),
          eq(collaborators.userId, userId.value)
        )
      );
    const journalIds = [...new Set(rows.map((row) => row.journalId))];
    if (!journalIds.length) {
      return [];
    }

    const schemas = await this.dbInstance.query.journals.findMany({
      where: or(
        eq(journals.ownerId, userId.value),
        inArray(journals.id, journalIds)
      ),
      with: {
        accounts: true,
        collaborators: true,
        tags: true,
      },
    });

    return schemas.map((schema) => mapJournalToDomain(schema));
  }

  async save(journal: Journal): Promise<void> {
    const [journalSchema, accountSchemas, collaboratorSchemas, tagSchemas] =
      mapJournalFromDomain(journal);
    await this.dbInstance.transaction(async (tx) => {
      await tx
        .insert(journals)
        .values(journalSchema)
        .onConflictDoUpdate({
          target: journals.id,
          set: {
            title: journalSchema.title,
            requiresApproval: journalSchema.requiresApproval,
            isArchived: journalSchema.isArchived,
          },
        });
      const promises = new Array<Promise<unknown>>();
      if (accountSchemas.length) {
        promises.push(
          tx
            .insert(journalAccounts)
            .values(accountSchemas)
            .onConflictDoNothing()
        );
      }
      const accountIds = accountSchemas.map(({ accountId }) => accountId);
      promises.push(
        tx
          .delete(journalAccounts)
          .where(
            and(
              eq(journalAccounts.journalId, journal.id.value),
              notInArray(journalAccounts.accountId, accountIds)
            )
          )
      );
      if (tagSchemas.length) {
        promises.push(tx.insert(tags).values(tagSchemas).onConflictDoNothing());
      }
      const tagIds = tagSchemas
        .map(({ id }) => id)
        .filter(Boolean)
        .map((id) => id!);
      promises.push(
        tx
          .delete(tags)
          .where(
            and(
              eq(tags.journalId, journal.id.value),
              notInArray(tags.id, tagIds)
            )
          )
      );
      if (collaboratorSchemas.length) {
        promises.push(
          tx
            .insert(collaborators)
            .values(collaboratorSchemas)
            .onConflictDoNothing()
        );
      }
      const collaboratorIds = collaboratorSchemas.map(({ userId }) => userId);
      promises.push(
        tx
          .delete(collaborators)
          .where(
            and(
              eq(collaborators.journalId, journal.id.value),
              notInArray(collaborators.userId, collaboratorIds)
            )
          )
      );
      await Promise.all(promises);
    });
  }
}
