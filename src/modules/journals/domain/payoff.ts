import { journalErrors } from "./errors";
import { Transaction } from "./transactions";

export class PayoffService {
  static markAsPayoffTransaction(
    paidOffTransaction: Transaction,
    alreadyPaidOffTransactions: Transaction[],
    toBePaidOffTransactions: Transaction[]
  ) {
    const alreadyPaidOffAmount = alreadyPaidOffTransactions.reduce(
      (sum, tx) => sum + tx.amount,
      0
    );
    const totalToBePaidOffAmount = toBePaidOffTransactions.reduce(
      (sum, tx) => sum + tx.amount,
      0
    );

    if (
      paidOffTransaction.amount <
      alreadyPaidOffAmount + totalToBePaidOffAmount
    ) {
      throw journalErrors.insufficientPaidOffTransaction;
    }
    toBePaidOffTransactions.forEach((tx) => {
      tx.markPaidOffBy(paidOffTransaction);
      paidOffTransaction.addRelatedTransaction(tx.id);
    });
  }

  static clearPayoffStatus(
    toClearStatusTransaction: Transaction,
    paidOffTransaction: Transaction
  ) {
    toClearStatusTransaction.clearPayoffStatus();
    paidOffTransaction.removeRelatedTransaction(toClearStatusTransaction.id);
  }
}
