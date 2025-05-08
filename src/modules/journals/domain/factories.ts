import { formatError } from "@/modules/shared/base/errors";
import { journalErrors } from "./errors";
import { Journal } from "./journal";
import { Transaction, TransactionCreate } from "./transactions";

export class TransactionFactory {
  static createTransaction(
    journal: Journal,
    props: Omit<TransactionCreate, "journalId">
  ): Transaction {
    if (journal.isArchived) {
      throw journalErrors.archivedJournal;
    }
    if (!journal.hasCollaborator(props.paidBy)) {
      throw formatError(journalErrors.journalNotAccessible, {
        user: props.paidBy.value,
      });
    }
    const missingTags = props.tags.filter((tag) => !journal.hasTag(tag));
    journal.addTags(missingTags);
    return Transaction.create(
      { ...props, journalId: journal.id }, // Include journalId
      { requiresApproval: journal.requiresApproval }
    );
  }
}
