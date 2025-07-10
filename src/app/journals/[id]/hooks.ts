"use client";
import {
  JournalDetailedDto,
  TransactionDetailedDto,
} from "@/modules/journals/application/dto/dtos.types";
import { JournalApi } from "@/modules/journals/presentation/api/journal.api";
import { TransactionFormSchema } from "@/modules/journals/presentation/components/forms";
import {
  IndexedDbJournal,
  IndexedDbTransaction,
  spendwiseIDb,
} from "@/modules/shared/presentation/components/indexed-db";
import { useLiveQuery } from "dexie-react-hooks";
import { DateTime, Interval } from "luxon";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { TransactionDialogType } from "../transaction-dialogs";

export function useTransactionActions({
  journal,
  journalApi,
  labels,
  handleRefreshJournal,
  setOpen,
  setDialogType,
  setSelectedTransaction,
  setSelectedAccountId,
  loadingStart,
  loadingEnd,
}: {
  journal: JournalDetailedDto;
  journalApi: JournalApi;
  labels: Record<string, string>;
  handleRefreshJournal: (
    subset?: ("account" | "transaction")[]
  ) => void | Promise<void>;
  setOpen: (open: boolean) => void;
  setDialogType: (type: TransactionDialogType | null) => void;
  setSelectedTransaction: (tx: TransactionDetailedDto | undefined) => void;
  setSelectedAccountId: (id: string | undefined) => void;
  loadingStart?: () => void;
  loadingEnd?: () => void;
}) {
  const handleCreateTransaction = async (data: TransactionFormSchema) => {
    try {
      const { transaction } = await journalApi.createTransaction(journal.id, {
        ...data,
        date: data.date.toISOString(),
      });
      await spendwiseIDb.transactions.put({
        ...transaction,
        journalId: journal.id,
      });
      setOpen(false);
      toast(labels.createTransactionSuccess);
    } catch (error) {
      console.error(error);
      // toast.error(labels.createTransactionFailed(error));
    }
  };

  const handleDeleteTransaction = async (
    transaction: TransactionDetailedDto
  ) => {
    try {
      await Promise.all([
        spendwiseIDb.transactions
          .delete(transaction.id)
          .then(() => setOpen(false)),
        journalApi
          .deleteTransaction(journal.id, transaction.id!)
          .then(() => toast("Successfully deleted transaction")),
      ]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete transaction");
    }
  };

  const handleAddTag = async (tag: string) => {
    try {
      await journalApi.addTags(journal.id, [tag]);
      await Promise.resolve(handleRefreshJournal());
      toast("Successfully added tags");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add tags");
    }
  };

  const handleEditTransaction = async (data: TransactionFormSchema) => {
    if (loadingStart) loadingStart();
    try {
      await Promise.all([
        (async () => {
          const tx = await spendwiseIDb.transactions
            .where("id")
            .equals(data.id!)
            .first();
          return spendwiseIDb.transactions.update(data.id!, {
            ...(tx ?? {}),
            ...data,
            id: data.id!,
            accountId: data.account!,
            journalId: journal.id,
            status: tx!.status,
            date: data.date.toISOString().split("T")[0],
            categoryId: data.categoryId,
          });
        })().then(() => setOpen(false)),
        journalApi.editTransaction(journal.id, data.id!, {
          ...data,
          date: data.date.toISOString(),
        }),
      ]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to edit transaction");
    } finally {
      if (loadingEnd) loadingEnd();
    }
  };

  const showNewTransactionDialog = () => {
    setDialogType("new");
    setOpen(true);
  };

  const showViewTransactionDialog = (transaction: TransactionDetailedDto) => {
    setSelectedTransaction(transaction);
    setDialogType("view");
    setOpen(true);
  };

  const showEditTransactionDialog = (transaction: TransactionDetailedDto) => {
    setSelectedTransaction(transaction);
    setDialogType("edit");
    setOpen(true);
  };

  const showDuplicateTransactionDialog = (
    transaction: TransactionDetailedDto
  ) => {
    setSelectedTransaction(transaction);
    setDialogType("duplicate");
    setOpen(true);
  };

  const showDeleteTransactionDialog = (transaction: TransactionDetailedDto) => {
    setSelectedTransaction(transaction);
    setDialogType("delete");
    setOpen(true);
  };

  const showAccountReportsDialog = (accountId: string) => {
    setSelectedAccountId(accountId);
    setDialogType("accountReport");
    setOpen(true);
  };

  return {
    handleCreateTransaction,
    handleDeleteTransaction,
    handleAddTag,
    handleEditTransaction,
    showNewTransactionDialog,
    showViewTransactionDialog,
    showEditTransactionDialog,
    showDuplicateTransactionDialog,
    showDeleteTransactionDialog,
    showAccountReportsDialog,
  };
}

// 1. useJournalData: loads and syncs journal/transactions from indexedDB and API
export function useJournalData(id: string, etag: string) {
  useEffect(() => {
    async function syncAndLoad() {
      // Check for journal in indexedDB
      const local = await spendwiseIDb.journals.where("id").equals(id).first();
      if (!local || local.etag !== etag) {
        console.log({ local, etag });
        // Fetch from API and update indexedDB
        const api = new JournalApi();
        const remote = await api.getJournalById(id);
        await spendwiseIDb.journals.put({ ...remote, etag });
        if (remote.transactions?.length) {
          await spendwiseIDb.transactions.bulkPut(
            remote.transactions.map((t) => ({ ...t, journalId: id }))
          );
        }
      }
    }
    syncAndLoad();
  }, [id, etag]);

  const journal = useLiveQuery(
    () => spendwiseIDb.journals.where("id").equals(id).first(),
    [id]
  );

  const txsRaw = useLiveQuery(() =>
    spendwiseIDb.transactions.where("journalId").equals(id).toArray()
  );

  const transactions: IndexedDbTransaction[] =
    txsRaw?.map((tx) => ({
      ...tx,
      status: tx.status as TransactionDetailedDto["status"],
      type: tx.type as TransactionDetailedDto["type"],
    })) ?? [];

  return { journal, transactions };
}

// 2. useJournalCalculations: memoized calculations for UI
export function useJournalStates({
  journal,
  transactions,
  month,
  language,
}: {
  journal?: IndexedDbJournal;
  transactions: IndexedDbTransaction[];
  month: DateTime;
  language: string;
}) {
  const [query, setQuery] = useState("");

  const transactionsThisMonth = useMemo(() => {
    const monthInterval = Interval.fromDateTimes(
      month,
      month.plus({ months: 1 })
    );
    return transactions.filter((tx) =>
      monthInterval.contains(DateTime.fromISO(tx.date))
    );
  }, [month, transactions]);

  const transactionsPrevMonth = useMemo(() => {
    const monthInterval = Interval.fromDateTimes(
      month.minus({ months: 1 }),
      month
    );
    return transactions.filter((tx) =>
      monthInterval.contains(DateTime.fromISO(tx.date))
    );
  }, [month, transactions]);

  const groupedByDate = useMemo(
    () =>
      transactionsThisMonth
        .filter((tx) => !query || tx.title.toLowerCase().includes(query))
        .sort((a, b) => {
          // 1. Sort by date descending
          const dateDiff = b.date.localeCompare(a.date);
          if (dateDiff !== 0) return dateDiff;
          // 2. Sort by id descending
          return b.id.localeCompare(a.id);
        })
        .reduce(
          (txsByDate, tx) => ({
            ...txsByDate,
            [tx.date]: [...(txsByDate[tx.date] ?? []), tx],
          }),
          {} as Record<string, IndexedDbTransaction[]>
        ),
    [transactionsThisMonth, query]
  );

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(language === "vi" ? "vi-VN" : "en-US", {
        style: "currency",
        currency: journal?.currency ?? "VND",
      }),
    [journal, language]
  );

  const spentThisMonth = transactionsThisMonth.reduce(
    (current, { amount }) => current + amount,
    0
  );

  const spentChange =
    spentThisMonth -
    transactionsPrevMonth.reduce((current, { amount }) => current + amount, 0);

  // Accounts summary from transactions
  const transactionsByAccount = useMemo(() => {
    const map: Record<string, { id: string; name: string; value: number }> = {};
    transactionsThisMonth.forEach((tx) => {
      if (!map[tx.accountId]) {
        map[tx.accountId] = {
          id: tx.accountId,
          name:
            journal?.accounts?.find((acc) => acc.accountId === tx.accountId)
              ?.displayName ?? "N/A",
          value: 0,
        };
      }
      map[tx.accountId].value += tx.amount;
    });
    return Object.values(map);
  }, [transactionsThisMonth, journal]);

  const formatDate = useCallback(
    (date: string) => {
      switch (language) {
        case "vi":
          return new Date(date).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        default:
          return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
      }
    },
    [language]
  );

  return {
    transactionsThisMonth,
    transactionsPrevMonth,
    groupedByDate,
    currencyFormatter,
    spentThisMonth,
    spentChange,
    transactionsByAccount,
    formatDate,
    setQuery,
  };
}

// 3. useJournalActions: dialog state and transaction actions
export function useJournalActions({
  journal,
  labels,
}: {
  journal?: IndexedDbJournal;
  labels: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const [dialogType, setDialogType] = useState<TransactionDialogType | null>(
    null
  );
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionDetailedDto>();
  const [selectedAccountId, setSelectedAccountId] = useState<string>();

  // Use the extracted transaction actions hook
  const actions = useTransactionActions({
    journal: journal as unknown as JournalDetailedDto, // Use correct type for compatibility
    journalApi: new JournalApi(),
    labels,
    handleRefreshJournal: async () => {}, // TODO: wire up
    setOpen,
    setDialogType,
    setSelectedTransaction,
    setSelectedAccountId,
  });

  return {
    open,
    setOpen,
    dialogType,
    setDialogType,
    selectedTransaction,
    setSelectedTransaction,
    selectedAccountId,
    setSelectedAccountId,
    actions,
  };
}
