import { SnowflakeIdentifier } from "@/modules/shared/base/identifiers";
import { AccountId, UserId } from "@/modules/shared/domain/identifiers";
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

interface TransactionProps {
  id: TransactionId;
  journalId: JournalId;
  title: string;
  amount: number;
  date: DateTime;
  account: AccountId;
  type: TransactionType;
  paidBy: UserId;
  tags: string[];
  status: TransactionStatus;
  notes?: string;
}

export type TransactionCreate = Omit<TransactionProps, "id" | "status">;
export type TransactionEdit = Partial<TransactionCreate>;
export type TransactionRestore = ExcludeMethods<Transaction>;

export class Transaction implements TransactionProps {
  private constructor(
    readonly id: TransactionId,
    readonly journalId: JournalId, // Added field
    public title: string,
    public amount: number,
    public date: DateTime,
    public account: AccountId,
    public type: TransactionType,
    public paidBy: UserId,
    public tags: string[],
    private _status: TransactionStatus,
    public notes?: string
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
      props.notes
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
      props.notes
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
}
