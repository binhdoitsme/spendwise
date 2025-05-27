import { UserId } from "@/modules/shared/domain/identifiers";
import { ListingOptions } from "@/modules/shared/domain/specs";
import { DateTime } from "luxon";
import { Journal, JournalId } from "./journal";
import { RichJournal } from "./rich-journal";
import { Transaction, TransactionId } from "./transactions";

export abstract class JournalRepository {
  abstract findById(journalId: JournalId): Promise<Journal | undefined>;
  abstract findByIdWithTransactions(
    journalId: JournalId,
    transactionOptions?: ListingOptions
  ): Promise<RichJournal | undefined>;
  abstract findByUser(userId: UserId): Promise<Journal[]>;
  abstract save(journal: Journal): Promise<void>;
}

export interface TransactionSearchSpecs {
  accountIds?: string[];
  query?: string;
  dateRange?: {
    start: DateTime;
    end: DateTime;
  };
}

export abstract class TransactionRepository {
  abstract findById(
    transactionId: TransactionId
  ): Promise<Transaction | undefined>;
  abstract findAllByIds(
    transactionIds: TransactionId[]
  ): Promise<Transaction[]>;
  abstract findBy(
    journalId: JournalId,
    specs: TransactionSearchSpecs,
    options: ListingOptions
  ): Promise<Transaction[]>;
  abstract save(transaction: Transaction): Promise<void>;
  abstract delete(transactionId: TransactionId): Promise<void>;
}
