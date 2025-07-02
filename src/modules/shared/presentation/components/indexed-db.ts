import { JournalDetailedDto } from "@/modules/journals/application/dto/dtos.types";
import Dexie from "dexie";

export interface IndexedDbJournal
  extends Omit<JournalDetailedDto, "transactions"> {
  etag: string;
}

export interface IndexedDbTransaction {
  id: string;
  accountId: string;
  amount: number;
  date: string;
  notes?: string;
  paidBy: string;
  status: string;
  tags: string[];
  title: string;
  type: "EXPENSE" | "INCOME" | "TRANSFER";
  journalId: string;
}

class _SpendwiseDexie extends Dexie {
  journals!: Dexie.Table<IndexedDbJournal, string>;
  transactions!: Dexie.Table<IndexedDbTransaction, string>;

  constructor() {
    super("SpendWise");
    this.version(1).stores({
      transactions:
        "id, accountId, amount, date, notes, paidBy, status, tags, title, type, journalId",
      journals:
        "id, etag, ownerId, ownerEmail, ownerFirstName, ownerLastName, title, currency, isArchived, tags, accounts, collaborators",
    });
  }
}

export type SpendwiseDexie = _SpendwiseDexie;
export const spendwiseIDb: SpendwiseDexie = new _SpendwiseDexie();
