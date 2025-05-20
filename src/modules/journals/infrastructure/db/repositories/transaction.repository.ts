import { eq, inArray } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { TransactionRepository } from "../../../domain/repositories";
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
