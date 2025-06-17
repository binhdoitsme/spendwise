import { UUIDIdentifier } from "@/modules/shared/base/identifiers";
import { AccountId } from "@/modules/shared/domain/identifiers";
import {
  ISOCurrency,
  MoneyAmount,
} from "@/modules/shared/presentation/currencies";
import { DateTime, Interval } from "luxon";
import { Journal, JournalId } from "./journal";
import { Transaction } from "./transactions";

export class RepaymentId extends UUIDIdentifier {}

export class Repayment {
  private constructor(
    readonly statementPeriod: Interval,
    readonly date: DateTime,
    readonly amount: MoneyAmount,
    readonly accountId: AccountId,
    readonly journalId: JournalId,
    readonly id: RepaymentId = new RepaymentId()
  ) {}

  static create({
    journal,
    date,
    transactions,
    statementPeriod,
  }: {
    journal: Journal;
    date: DateTime;
    transactions: Transaction[];
    statementPeriod: Interval;
  }) {
    const amount = transactions.reduce(
      (current, { amount }) => amount + current,
      0
    );
    return new Repayment(
      statementPeriod,
      date,
      {
        amount,
        currency: journal.currency as ISOCurrency,
      },
      transactions[0].account,
      journal.id
    );
  }

  static restore({
    id,
    date,
    accountId,
    journalId,
    statementPeriod,
    amount,
    currency,
  }: {
    id: string;
    date: DateTime;
    journalId: string;
    accountId: string;
    statementPeriod: Interval;
    amount: number;
    currency: string;
  }) {
    return new Repayment(
      statementPeriod,
      date,
      {
        amount,
        currency: currency as ISOCurrency,
      },
      new AccountId(accountId),
      new JournalId(journalId),
      new RepaymentId(id)
    );
  }
}

export class RepaymentService {
  static createRepayment(
    journal: Journal,
    {
      date,
      transactions,
      statementPeriod,
    }: {
      date: DateTime;
      transactions: Transaction[];
      statementPeriod: Interval;
    }
  ) {
    const repayment = Repayment.create({
      journal,
      date,
      transactions,
      statementPeriod,
    });
    journal.addRepayment(repayment);
    return repayment;
  }
}
