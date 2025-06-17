import { AccountId, UserId } from "@/modules/shared/domain/identifiers";
import { ListingOptions } from "@/modules/shared/domain/specs";
import { Email } from "@/modules/shared/domain/value-objects";
import { DateTime, Interval } from "luxon";
import { JournalCollaboratorPermission } from "../../domain/collaborator";
import { journalErrors } from "../../domain/errors";
import { TransactionFactory } from "../../domain/factories";
import { Journal, JournalId } from "../../domain/journal";
import { RepaymentService } from "../../domain/repayments";
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
  RepaymentPayload,
  TransactionCreateDto,
  TransactionEditDto,
} from "../dto/dtos.types";
import {
  mapJournalToJournalBasicDto,
  mapRichJournalToJournalDetailedDto,
  mapTransactionToDetailedDto,
} from "../dto/mappers";

export interface JournalTransactionSpecsInput {
  query?: string;
  creditOnly?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

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

  async getTransactionsByJournalId(
    id: string,
    specs: JournalTransactionSpecsInput,
    options: ListingOptions = {
      orderBy: "date",
      orderDesc: true,
    }
  ) {
    const journalId = new JournalId(id);
    const journal = await this.getBasicJournal(id);
    const accounts = await this.accountResolver.resolveMany(
      [...journal.accounts.keys()].map((id) => new AccountId(id))
    );
    const accountIds = accounts
      .filter((account) => account.type === "credit")
      .map((account) => account.id.value);
    const searchSpecs = {
      accountIds: specs.creditOnly
        ? accountIds.map((id) => new AccountId(id))
        : undefined,
      dateRange: specs.dateRange
        ? {
            start: DateTime.fromISO(specs.dateRange.start, { zone: "utc" }),
            end: DateTime.fromISO(specs.dateRange.end, { zone: "utc" }),
          }
        : undefined,
      query: specs.query,
    };
    const transactions = await this.transactionRepository.findBy(
      journalId,
      searchSpecs,
      options
    );
    if (!transactions) {
      throw this.journalNotFound;
    }
    return transactions.map(mapTransactionToDetailedDto);
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
      date: DateTime.fromISO(data.date, { zone: "utc" }),
      account: new AccountId(data.account),
      type: data.type as TransactionType,
      paidBy: new UserId(data.paidBy),
      tags: data.tags ?? [],
      notes: data.notes,
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

  async createRepayment(payload: RepaymentPayload) {
    const { accountId, statementMonth } = payload;
    const account = await this.accountResolver.resolveOne(
      new AccountId(accountId)
    );
    if (!account) {
      throw journalErrors.accountNotFound;
    }
    const statementMonthStart = DateTime.fromFormat(statementMonth, "yyyyMM", {
      zone: "utc",
    }).set({ day: account?.statementDay });
    const statementMonthEnd = statementMonthStart.plus({ months: 1 });
    const journal = await this.getBasicJournal(payload.journalId);
    const transactions = await this.transactionRepository.findBy(journal.id, {
      accountIds: [account.id],
      dateRange: {
        start: statementMonthStart!,
        end: statementMonthEnd!,
      },
    });
    const repayment = RepaymentService.createRepayment(journal, {
      transactions,
      statementPeriod: Interval.fromDateTimes(
        statementMonthStart,
        statementMonthEnd
      ),
      date: DateTime.fromISO(payload.paymentDate, { zone: "utc" }),
    });
    await this.journalRepository.save(journal);
    return { id: repayment.id.value };
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

  async deleteTransaction(userId: string, transactionId: string) {
    const transaction = await this.transactionRepository.findById(
      new TransactionId(transactionId)
    );
    if (!transaction) {
      throw { code: 404, message: "Transaction not found" };
    }
  }
}
