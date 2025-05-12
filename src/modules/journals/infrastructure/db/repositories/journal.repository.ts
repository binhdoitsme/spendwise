import { UserId } from "@/modules/shared/domain/identifiers";
import { asc, desc, eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Journal, JournalId } from "../../../domain/journal";
import {
  JournalRepository,
  ListingOptions,
} from "../../../domain/repositories";
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
    const schemas = await this.dbInstance.query.journals.findMany({
      where: eq(journals.ownerId, userId.value),
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
      if (tagSchemas.length) {
        promises.push(tx.insert(tags).values(tagSchemas).onConflictDoNothing());
      }
      if (collaboratorSchemas.length) {
        promises.push(
          tx
            .insert(collaborators)
            .values(collaboratorSchemas)
            .onConflictDoNothing()
        );
      }
      await Promise.all(promises);
    });
  }
}
