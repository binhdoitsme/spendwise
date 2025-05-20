import { AccountId, UserId } from "@/modules/shared/domain/identifiers";
import { ListingOptions } from "@/modules/shared/domain/specs";
import { Email } from "@/modules/shared/domain/value-objects";
import { DateTime } from "luxon";
import { JournalCollaboratorPermission } from "../../domain/collaborator";
import { journalErrors } from "../../domain/errors";
import { TransactionFactory } from "../../domain/factories";
import { Journal, JournalId } from "../../domain/journal";
import { PayoffService } from "../../domain/payoff";
import {
  JournalRepository,
  TransactionRepository,
} from "../../domain/repositories";
import { TransactionId, TransactionType } from "../../domain/transactions";
import { JournalAccountResolver } from "../contracts/account-resolver";
import { JournalUserResolver } from "../contracts/user-resolver";
import {
  JournalCreateDto,
  JournalEditDto,
  TransactionCreateDto,
  TransactionEditDto,
} from "../dto/dtos.types";
import {
  mapJournalToJournalBasicDto,
  mapRichJournalToJournalDetailedDto,
} from "../dto/mappers";

export class JournalServices {
  constructor(
    private readonly journalRepository: JournalRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly userResolver: JournalUserResolver,
    private readonly accountResolver: JournalAccountResolver
  ) {}

  private get journalNotFound() {
    return { code: 404, message: "Journal not found" };
  }

  async listJournals(userId: string) {
    const journals = await this.journalRepository.findByUser(
      new UserId(userId)
    );
    return journals.map(mapJournalToJournalBasicDto);
  }

  async getJournalById(
    id: string,
    transactionOptions: ListingOptions = {
      orderBy: "date",
      orderDesc: true,
    }
  ) {
    const journalId = new JournalId(id);
    const journal = await this.journalRepository.findByIdWithTransactions(
      journalId,
      transactionOptions
    );
    if (!journal) {
      throw this.journalNotFound;
    }
    const collaborators = await this.userResolver.resolveMany(
      new Set(
        Array.from(journal.journal.collaborators.keys()).map(
          (id) => new UserId(id)
        )
      )
    );
    const accounts = await this.accountResolver.resolveMany(
      Array.from(journal.journal.accounts.keys()).map((id) => new AccountId(id))
    );
    return mapRichJournalToJournalDetailedDto(journal, collaborators, accounts);
  }

  private async getBasicJournal(id: string) {
    const journal = await this.journalRepository.findById(new JournalId(id));
    if (!journal) {
      throw this.journalNotFound;
    }
    return journal;
  }

  private async getOwnJournal(id: string, userId: string) {
    const journal = await this.journalRepository.findById(new JournalId(id));
    if (!journal) {
      throw this.journalNotFound;
    }
    if (journal.ownerId.value !== userId) {
      throw { code: 403, message: "You are not the owner of this journal" };
    }
    return journal;
  }

  async createJournal(data: JournalCreateDto) {
    const journal = Journal.create({
      ownerId: new UserId(data.ownerId),
      ownerEmail: Email.from(data.ownerEmail),
      title: data.title,
      currency: data.currency, // Added currency field
    });
    await this.journalRepository.save(journal);
    return mapJournalToJournalBasicDto(journal);
  }

  async editJournal(id: string, data: JournalEditDto) {
    const detailedJournal =
      await this.journalRepository.findByIdWithTransactions(new JournalId(id), {
        limit: 1,
      });
    const journal = await this.getBasicJournal(id);
    if (data.title) journal.title = data.title;
    if (data.currency && !detailedJournal?.transactions?.length) {
      journal.currency = data.currency; // Added currency field
    }
    await this.journalRepository.save(journal);
    return mapJournalToJournalBasicDto(journal);
  }

  async archiveJournal(id: string) {
    const journal = await this.getBasicJournal(id);
    journal.isArchived = true;
    await this.journalRepository.save(journal);
  }

  async unarchiveJournal(id: string) {
    const journal = await this.getBasicJournal(id);
    journal.isArchived = false;
    await this.journalRepository.save(journal);
  }

  async linkAccount({
    id,
    accountId,
    ownerId,
  }: {
    id: string;
    accountId: string;
    ownerId: string;
  }) {
    const journal = await this.getBasicJournal(id);
    journal.linkAccount(new AccountId(accountId), new UserId(ownerId));
    await this.journalRepository.save(journal);
  }

  async unlinkAccount(id: string, accountId: string) {
    const richJournal = await this.journalRepository.findByIdWithTransactions(
      new JournalId(id)
    );
    if (!richJournal) {
      throw this.journalNotFound;
    }
    if (richJournal.transactions.some((t) => t.account.value === accountId)) {
      throw journalErrors.accountAlreadyInUse;
    }
    const journal = await this.getBasicJournal(id);
    journal.unlinkAccount(new AccountId(accountId));
    await this.journalRepository.save(journal);
  }

  async inviteCollaborator({
    journalId,
    userId,
    email,
    permission,
  }: {
    journalId: string;
    userId: string;
    email: string;
    permission: string;
  }) {
    const journal = await this.getOwnJournal(journalId, userId);
    const invitedUser = await this.userResolver.resolveOneByEmail(
      Email.from(email)
    );
    if (!invitedUser) {
      throw { code: 404, message: "User not found" };
    }
    if (journal.hasCollaborator(invitedUser.id)) {
      throw { code: 409, message: "User already invited" };
    }
    journal.addCollaborator(
      invitedUser.id,
      permission as JournalCollaboratorPermission
    );
    await this.journalRepository.save(journal);
  }

  async createTransaction(journalId: string, data: TransactionCreateDto) {
    const journal = await this.getBasicJournal(journalId);
    const transaction = TransactionFactory.createTransaction(journal, {
      title: data.title,
      amount: data.amount,
      date: DateTime.fromISO(data.date),
      account: new AccountId(data.account),
      type: data.type as TransactionType,
      paidBy: new UserId(data.paidBy),
      tags: data.tags ?? [],
      notes: data.notes,
      paidOffTransaction: undefined, // explicitly ask to mark as paid by/not paid by
      relatedTransactions: [],
    });
    await this.transactionRepository.save(transaction);
    return transaction.id.value;
  }

  async editTransaction(transactionId: string, data: TransactionEditDto) {
    const transaction = await this.transactionRepository.findById(
      new TransactionId(transactionId)
    );
    if (!transaction) {
      throw { code: 404, message: "Transaction not found" };
    }
    transaction.edit({
      title: data.title,
      amount: data.amount,
      date: data.date ? DateTime.fromISO(data.date) : undefined,
      account: data.account ? new AccountId(data.account) : undefined,
      type: data.type as TransactionType,
      paidBy: data.paidBy ? new UserId(data.paidBy) : undefined,
      tags: data.tags,
      notes: data.notes,
    });
    await this.transactionRepository.save(transaction);
  }

  async markAsPaidOff(paidOffTransactionId: string, transactionIds: string[]) {
    const paidOffTransactionIdObj = new TransactionId(paidOffTransactionId);
    const paidOffTransaction = await this.transactionRepository.findById(
      paidOffTransactionIdObj
    );
    if (!paidOffTransaction) {
      throw { code: 404, message: "Paid-off transaction not found" };
    }
    const alreadyPaidByPaidOffTransaction =
      await this.transactionRepository.findAllByIds(
        paidOffTransaction.relatedTransactions
      );
    const toBePaidOffTransactions =
      await this.transactionRepository.findAllByIds(
        transactionIds.map((id) => new TransactionId(id))
      );
    PayoffService.markAsPayoffTransaction(
      paidOffTransaction,
      alreadyPaidByPaidOffTransaction,
      toBePaidOffTransactions
    );
    for (const transaction of toBePaidOffTransactions) {
      await this.transactionRepository.save(transaction);
    }
  }

  async clearPayoffStatus(transactionId: string) {
    const transaction = await this.transactionRepository.findById(
      new TransactionId(transactionId)
    );
    if (!transaction) {
      throw { code: 404, message: "Transaction not found" };
    }
    if (!transaction.paidOffTransaction) {
      return;
    }
    const paidOffTransaction = await this.transactionRepository.findById(
      transaction.paidOffTransaction
    );
    if (!paidOffTransaction) {
      throw { code: 404, message: "Paid-off transaction not found" };
    }

    PayoffService.clearPayoffStatus(transaction, paidOffTransaction);
    await this.transactionRepository.save(transaction);
    await this.transactionRepository.save(paidOffTransaction);
  }

  async removeTransaction(transactionId: string) {
    await this.transactionRepository.delete(new TransactionId(transactionId));
  }

  async addCollaborator(journalId: string, userId: string, permission: string) {
    const journal = await this.getBasicJournal(journalId);
    journal.addCollaborator(
      new UserId(userId),
      permission as JournalCollaboratorPermission
    );
    await this.journalRepository.save(journal);
  }

  async removeCollaborator(journalId: string, userId: string) {
    const journal = await this.getBasicJournal(journalId);
    journal.removeCollaborator(new UserId(userId));
    await this.journalRepository.save(journal);
  }

  async addTags(journalId: string, tags: string[]) {
    const journal = await this.getBasicJournal(journalId);
    journal.addTags(tags);
    await this.journalRepository.save(journal);
  }

  async removeTags(journalId: string, tags: string[]) {
    const journal = await this.getBasicJournal(journalId);
    journal.removeTags(tags);
    await this.journalRepository.save(journal);
  }

  async deleteTransactions(
    userId: string,
    journalId: string,
    transactionIds: string[],
    removeRelated: boolean = false
  ) {
    const journal = await this.getBasicJournal(journalId);
    if (journal.ownerId.value !== userId) {
      throw { code: 403, message: "You are not the owner of this journal" };
    }
    const transactions = await this.transactionRepository.findAllByIds(
      transactionIds.map((id) => new TransactionId(id))
    );
    if (removeRelated) {
      for (const transaction of transactions) {
        if (transaction.relatedTransactions.length > 0) {
          await this.transactionRepository.delete(transaction.id);
        }
      }
    } else {
      for (const transaction of transactions) {
        await this.transactionRepository.delete(transaction.id);
      }
    }
  }
}
