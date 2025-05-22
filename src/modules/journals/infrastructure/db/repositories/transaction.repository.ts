import { JournalId } from "@/modules/journals/domain/journal";
import { ListingOptions } from "@/modules/shared/domain/specs";
import { and, asc, desc, eq, gte, ilike, inArray, lt, or } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import {
  TransactionRepository,
  TransactionSearchSpecs,
} from "../../../domain/repositories";
import { Transaction, TransactionId } from "../../../domain/transactions";
import { mapTransactionFromDomain, mapTransactionToDomain } from "../mappers";
import * as schema from "../schemas";
import { transactions } from "../schemas";

export class DrizzleTransactionRepository implements TransactionRepository {
  constructor(private readonly dbInstance: NodePgDatabase<typeof schema>) {}

  async findById(
    transactionId: TransactionId
  ): Promise<Transaction | undefined> {
    const schema = await this.dbInstance
      .select()
      .from(transactions)
      .where(eq(transactions.id, transactionId.value))
      .limit(1);
    return schema[0] ? mapTransactionToDomain(schema[0]) : undefined;
  }

  async findAllByIds(transactionIds: TransactionId[]): Promise<Transaction[]> {
    const schemas = await this.dbInstance
      .select()
      .from(transactions)
      .where(
        inArray(
          transactions.id,
          transactionIds.map((id) => id.value)
        )
      );
    return schemas.map(mapTransactionToDomain);
  }

  async findBy(
    journalId: JournalId,
    specs: TransactionSearchSpecs,
    options: ListingOptions
  ): Promise<Transaction[]> {
    const conditions = [eq(transactions.journalId, journalId.value)];

    if (specs.accountIds) {
      conditions.push(inArray(transactions.account, specs.accountIds));
    }
    if (specs.query) {
      const query = specs.query.toLowerCase();
      conditions.push(
        or(
          ilike(transactions.title, `%${query}%`),
          ilike(transactions.notes, `%${query}%`)
        )!
      );
    }
    if (specs.dateRange) {
      conditions.push(
        and(
          gte(transactions.date, specs.dateRange.start.toJSDate()),
          lt(transactions.date, specs.dateRange.end.toJSDate())
        )!
      );
    }
    const query = this.dbInstance
      .select()
      .from(transactions)
      .where(and(...conditions));
    if (options.limit) {
      query.limit(options.limit);
    }
    if (options.offset) {
      query.offset(options.offset);
    }
    if (options.orderBy) {
      const orderBy = options.orderDesc ? desc : asc;
      const orderKey =
        options.orderBy as keyof typeof transactions.$inferSelect;
      query.orderBy(orderBy(transactions[orderKey]));
    }
    const schemas = await query;
    return schemas.map(mapTransactionToDomain);
  }

  async save(transaction: Transaction): Promise<void> {
    const schema = mapTransactionFromDomain(transaction);
    await this.dbInstance
      .insert(transactions)
      .values(schema)
      .onConflictDoUpdate({
        target: [transactions.id],
        set: {
          title: schema.title,
          amount: schema.amount,
          date: schema.date,
          type: schema.type,
          status: schema.status,
          notes: schema.notes,
          account: schema.account,
          paidBy: schema.paidBy,
          tags: schema.tags,
        },
      });
  }

  async delete(transactionId: TransactionId): Promise<void> {
    await this.dbInstance
      .delete(transactions)
      .where(eq(transactions.id, transactionId.value));
  }
}
