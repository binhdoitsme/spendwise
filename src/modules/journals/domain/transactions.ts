import { SnowflakeIdentifier } from "@/modules/shared/base/identifiers";
import { AccountId } from "@/modules/shared/domain/identifiers";
import { Email } from "@/modules/shared/domain/value-objects";
import { ExcludeMethods } from "@/types";
import { DateTime } from "luxon";
import { JournalId } from "./journal";

export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
  TRANSFER = "TRANSFER",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  AUTO_APPROVED = "AUTO_APPROVED",
}

export class TransactionId extends SnowflakeIdentifier {}

export type TransactionCreate = Omit<
  ExcludeMethods<Transaction>,
  "id" | "status"
>;
export type TransactionEdit = Partial<TransactionCreate>;
export type TransactionRestore = ExcludeMethods<Transaction>;

export class Transaction {
  private constructor(
    readonly id: TransactionId,
    readonly journalId: JournalId, // Added field
    public title: string,
    public amount: number,
    public date: DateTime,
    public account: AccountId,
    public type: TransactionType,
    public paidBy: Email,
    public tags: string[],
    private _status: TransactionStatus,
    public notes?: string,
    private _paidOffTransaction?: TransactionId,
    private _relatedTransactions: TransactionId[] = [] // Added field
  ) {}

  static create(
    props: TransactionCreate & { journalId: JournalId }, // Updated type
    options: { requiresApproval: boolean }
  ): Transaction {
    const id = new TransactionId();
    const status = options.requiresApproval
      ? TransactionStatus.PENDING
      : TransactionStatus.AUTO_APPROVED;
    return new Transaction(
      id,
      props.journalId, // Pass journalId
      props.title,
      props.amount,
      props.date,
      props.account,
      props.type,
      props.paidBy,
      props.tags,
      status,
      props.notes,
      props.paidOffTransaction,
      props.relatedTransactions
    );
  }

  static restore(props: TransactionRestore): Transaction {
    return new Transaction(
      props.id,
      props.journalId, // Pass journalId
      props.title,
      props.amount,
      props.date,
      props.account,
      props.type,
      props.paidBy,
      props.tags,
      props.status,
      props.notes,
      props.paidOffTransaction,
      props.relatedTransactions
    );
  }

  get status(): TransactionStatus {
    return this._status;
  }

  approve() {
    if (this._status === TransactionStatus.PENDING)
      this._status = TransactionStatus.APPROVED;
  }

  reject() {
    if (this._status === TransactionStatus.PENDING)
      this._status = TransactionStatus.REJECTED;
  }

  edit(updates: TransactionEdit) {
    if (Object.keys(updates).length === 0) {
      return false;
    }
    this.title = updates.title ?? this.title;
    this.amount = updates.amount ?? this.amount;
    this.date = updates.date ?? this.date;
    this.account = updates.account ?? this.account;
    this.type = updates.type ?? this.type;
    this.paidBy = updates.paidBy ?? this.paidBy;
    this.tags = updates.tags ?? this.tags;
    this.notes = updates.notes ?? this.notes;
    return true;
  }

  get paidOffTransaction() {
    return this._paidOffTransaction;
  }

  markPaidOffBy(transaction: Transaction) {
    this._paidOffTransaction = transaction.id;
  }

  clearPayoffStatus() {
    this._paidOffTransaction = undefined;
  }

  get relatedTransactions(): TransactionId[] {
    return [...this._relatedTransactions];
  }

  addRelatedTransaction(transactionId: TransactionId) {
    if (!this._relatedTransactions.some((id) => id.equals(transactionId))) {
      this._relatedTransactions.push(transactionId);
    }
  }

  removeRelatedTransaction(transactionId: TransactionId) {
    this._relatedTransactions = this._relatedTransactions.filter(
      (id) => !id.equals(transactionId)
    );
  }
}
