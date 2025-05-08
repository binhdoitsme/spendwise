import { UserId } from "@/modules/shared/domain/identifiers";
import { eq } from "drizzle-orm";
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
    if (!journalSchema) {
      return undefined;
    }
    const journal = mapJournalToDomain(journalSchema);
    const transactionList = journalSchema.transactions
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
      await Promise.all([
        tx.insert(journalAccounts).values(accountSchemas).onConflictDoNothing(),
        tx.insert(tags).values(tagSchemas).onConflictDoNothing(),
        tx
          .insert(collaborators)
          .values(collaboratorSchemas)
          .onConflictDoNothing(),
      ]);
    });
  }
}
