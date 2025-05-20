import { AccountId, UserId } from "@/modules/shared/domain/identifiers";
import { DateTime } from "luxon";
import { JournalId } from "./journal";
import { PayoffService } from "./payoff";
import {
  Transaction,
  TransactionId,
  TransactionStatus,
  TransactionType,
} from "./transactions";

// Helper to create transactions with common fields
function createTransaction({
  id,
  title,
  amount,
  notes,
  paidOffTransaction = undefined,
  relatedTransactions = [],
}: {
  id: string;
  title: string;
  amount: number;
  notes: string;
  paidOffTransaction?: TransactionId;
  relatedTransactions?: TransactionId[];
}) {
  return Transaction.restore({
    id: new TransactionId(id),
    journalId: new JournalId("journal-id"),
    title,
    amount,
    date: DateTime.utc(),
    account: new AccountId("account-id"),
    type: TransactionType.EXPENSE,
    paidBy: new UserId("user-id"),
    tags: [],
    status: TransactionStatus.AUTO_APPROVED,
    notes,
    paidOffTransaction,
    relatedTransactions,
  });
}

describe("PayoffService", () => {
  describe("markAsPayoffTransaction", () => {
    it("should mark transactions as paid off", () => {
      const paidOffTransaction = createTransaction({
        id: "paid-off-id",
        title: "Paid Off Transaction",
        amount: 100,
        notes: "Paid off transaction",
      });
      const alreadyPaidOffTransactions = [
        createTransaction({
          id: "already-paid-off-id-1",
          title: "Already Paid Off Transaction 1",
          amount: 50,
          notes: "Already paid off transaction 1",
        }),
        createTransaction({
          id: "already-paid-off-id-2",
          title: "Already Paid Off Transaction 2",
          amount: 20,
          notes: "Already paid off transaction 2",
        }),
      ];
      const toBePaidOffTransactions = [
        createTransaction({
          id: "to-be-paid-off-id-1",
          title: "To Be Paid Off Transaction 1",
          amount: 20,
          notes: "To be paid off transaction 1",
        }),
        createTransaction({
          id: "to-be-paid-off-id-2",
          title: "To Be Paid Off Transaction 2",
          amount: 10,
          notes: "To be paid off transaction 2",
        }),
      ];
      PayoffService.markAsPayoffTransaction(
        paidOffTransaction,
        alreadyPaidOffTransactions,
        toBePaidOffTransactions
      );

      expect(toBePaidOffTransactions[0].paidOffTransaction).not.toBeUndefined();
      expect(toBePaidOffTransactions[1].paidOffTransaction).not.toBeUndefined();
      expect(toBePaidOffTransactions[0].paidOffTransaction?.value).toEqual(
        paidOffTransaction.id.value
      );
      expect(toBePaidOffTransactions[1].paidOffTransaction?.value).toEqual(
        paidOffTransaction.id.value
      );
    });

    it("should throw an error if the paid off transaction amount is insufficient", () => {
      const paidOffTransaction = createTransaction({
        id: "paid-off-id",
        title: "Paid Off Transaction",
        amount: 100,
        notes: "Paid off transaction",
      });
      const alreadyPaidOffTransactions = [
        createTransaction({
          id: "already-paid-off-id-1",
          title: "Already Paid Off Transaction 1",
          amount: 50,
          notes: "Already paid off transaction 1",
        }),
      ];
      const toBePaidOffTransactions = [
        createTransaction({
          id: "to-be-paid-off-id-1",
          title: "To Be Paid Off Transaction 1",
          amount: 80,
          notes: "To be paid off transaction 1",
        }),
      ];

      expect(() => {
        PayoffService.markAsPayoffTransaction(
          paidOffTransaction,
          alreadyPaidOffTransactions,
          toBePaidOffTransactions
        );
      }).toThrow();
    });
  });
});
