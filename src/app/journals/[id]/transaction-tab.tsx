"use client";
import { useLoader } from "@/app/loader.context";
import { useI18n } from "@/components/common/i18n";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthContext } from "@/modules/auth/presentation/components/auth-context";
import {
  JournalAccountBasicDto,
  JournalDetailedDto,
  JournalUserBasicDto,
  TransactionDetailedDto,
} from "@/modules/journals/application/dto/dtos.types";
import { JournalApi } from "@/modules/journals/presentation/api/journal.api";
import { TransactionFormSchema } from "@/modules/journals/presentation/components/forms";
import {
  deleteTransaction,
  editTransaction,
  viewTransaction,
} from "@/modules/journals/presentation/components/transaction/transaction-commands";
import {
  FilterSchema,
  TransactionQuickFilters,
} from "@/modules/journals/presentation/components/transaction/transaction-filters";
import {
  AccountSelectProps,
  TransactionForm,
} from "@/modules/journals/presentation/components/transaction/transaction-form";
import { TransactionItem } from "@/modules/journals/presentation/components/transaction/transaction-item";
import { TransactionSearch } from "@/modules/journals/presentation/components/transaction/transaction-search";
import { convertToCurrentUser } from "@/modules/users/presentation/components/display-user";
import { PlusIcon } from "lucide-react";
import { DateTime } from "luxon";
import { AnimatePresence, motion } from "motion/react";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { journalDetailsPageLabels } from "./labels";

export interface TransactionTabProps {
  journal: JournalDetailedDto;
  api: JournalApi;
  handleNoAccount: () => void;
  handleRefreshJournal: () => void | Promise<void>;
  handleRefreshTransactionList: (
    transactions: TransactionDetailedDto[]
  ) => void | Promise<void>;
}

const toDateRange = (filters: Partial<FilterSchema>) => {
  if (!filters.filterByDate) {
    return undefined;
  }
  if (filters.datePreset === "custom") {
    return {
      start: filters.startDate!.toISOString().split("T")[0],
      end: filters.endDate!.toISOString().split("T")[0],
    };
  }
  if (filters.datePreset === "current-month") {
    const monthStart = DateTime.utc().startOf("month");
    return {
      start: monthStart.toISODate(),
      end: monthStart.plus({ months: 1 }).toISODate(),
    };
  }
  if (filters.datePreset === "last-month") {
    const lastMonthStart = DateTime.utc().startOf("month").minus({ months: 1 });
    return {
      start: lastMonthStart.toISODate(),
      end: lastMonthStart.plus({ months: 1 }).toISODate(),
    };
  }
  if (filters.datePreset === "recent-2-months") {
    const lastMonthStart = DateTime.utc().startOf("month").minus({ months: 1 });
    return {
      start: lastMonthStart.toISODate(),
      end: lastMonthStart.plus({ months: 2 }).toISODate(),
    };
  }
};

export function TransactionTab({
  journal,
  api,
  handleNoAccount,
  handleRefreshJournal,
  handleRefreshTransactionList,
}: TransactionTabProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState<ReactNode | null>(null);
  const [currentFilters, setFilters] = useState<
    Partial<FilterSchema> & { query?: string }
  >();

  const authContext = useAuthContext();
  const { loadingStart, loadingEnd, isLoading } = useLoader();
  const { language } = useI18n();
  const labels = journalDetailsPageLabels[language];

  const handleQuickFilters = async (filters: FilterSchema) => {
    loadingStart();
    const dateRange = toDateRange(filters);
    const transactions = await api.listTransactions(journal.id, {
      creditOnly: filters.showCredit,
      dateRange: dateRange,
      query: currentFilters?.query,
    });
    await handleRefreshTransactionList(transactions);
    setFilters({ ...currentFilters, ...filters });
    loadingEnd();
  };

  const handleSearch = async (query: string) => {
    loadingStart();
    const dateRange = currentFilters ? toDateRange(currentFilters) : undefined;
    const transactions = await api.listTransactions(journal.id, {
      creditOnly: currentFilters?.showCredit,
      dateRange: dateRange,
      query,
    });
    await handleRefreshTransactionList(transactions);
    setFilters({ ...currentFilters, query });
    loadingEnd();
  };

  const handleCreateTransaction = async (data: TransactionFormSchema) => {
    try {
      await api.createTransaction(journal.id, {
        ...data,
        date: data.date.toISOString(),
      });
      await handleRefreshJournal();
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create transaction");
    }
  };

  const handleDeleteTransaction = async (
    transaction: TransactionDetailedDto
  ) => {
    try {
      await api.deleteTransaction(journal.id, transaction.id!);
      await handleRefreshJournal();
      toast("Successfully deleted transaction");
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete transaction");
    }
  };

  const handleAddTag = async (tag: string) => {
    try {
      await api.addTags(journal.id, [tag]);
      await handleRefreshJournal();
      toast("Successfully added tags");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add tags");
    }
  };

  const handleEditTransaction = async (data: TransactionFormSchema) => {
    try {
      await api.editTransaction(journal.id, data.id!, {
        ...data,
        date: data.date.toISOString(),
      });
      await handleRefreshJournal();
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to edit transaction");
    }
  };

  const showNewTransactionDialog = () => {
    setContent(
      <>
        <DialogHeader>
          <DialogTitle>{labels.newTransaction}</DialogTitle>
        </DialogHeader>
        <Separator />
        <TransactionForm
          language={language}
          accounts={selectableAccounts}
          tags={journal.tags}
          collaborators={journal.collaborators.map(({ user }) => user)}
          onSubmit={(data) => handleCreateTransaction(data)}
          onNoAccount={() => {
            setOpen(false);
            setTimeout(() => handleNoAccount?.());
          }}
          onUnknownTag={handleAddTag}
        />
      </>
    );
    setOpen(true);
  };

  const showViewTransactionDialog = async (
    transaction: TransactionDetailedDto
  ) => {
    setContent(
      <>
        <DialogHeader>
          <DialogTitle>{labels.transactionDetails}</DialogTitle>
        </DialogHeader>
        <TransactionForm
          language={language}
          transaction={transaction}
          isReadonly
          accounts={selectableAccounts}
          tags={journal.tags}
          collaborators={journal.collaborators.map(({ user }) => user)}
          onSubmit={handleCreateTransaction}
          onNoAccount={() => {
            setOpen(false);
            setTimeout(() => handleNoAccount?.());
          }}
          onUnknownTag={handleAddTag}
        />
      </>
    );
    setOpen(true);
  };

  const showEditTransactionDialog = async (
    transaction: TransactionDetailedDto
  ) => {
    setContent(
      <>
        <DialogHeader>
          <DialogTitle>{labels.editTransaction}</DialogTitle>
        </DialogHeader>
        <TransactionForm
          language={language}
          transaction={transaction}
          accounts={selectableAccounts}
          tags={journal.tags}
          collaborators={journal.collaborators.map(({ user }) => user)}
          onSubmit={handleEditTransaction}
          onNoAccount={() => {
            setOpen(false);
            setTimeout(() => handleNoAccount?.());
          }}
          onUnknownTag={handleAddTag}
        />
      </>
    );
    setOpen(true);
  };

  const showDeleteTransactionDialog = async (
    transaction: TransactionDetailedDto
  ) => {
    setContent(
      <>
        <DialogHeader>
          <DialogTitle>Confirm deletion</DialogTitle>
        </DialogHeader>
        <p>Are you sure want to delete this transaction?</p>
        <div className="space-x-2">
          <Button
            variant="destructive"
            onClick={async () => await handleDeleteTransaction(transaction)}
          >
            Yes
          </Button>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            No
          </Button>
        </div>
      </>
    );
    setOpen(true);
  };

  const selectableAccounts = journal.accounts
    .map(({ ownerId, displayName, accountId }) => ({
      name: displayName,
      accountId,
      ownerId,
    }))
    .reduce(
      (prev, next) => ({
        ...prev,
        [next.ownerId]: [...(prev[next.ownerId] ?? []), next],
      }),
      {} as Record<string, AccountSelectProps[]>
    );

  const collaborators = journal.collaborators
    .map(({ user }) =>
      convertToCurrentUser(user, authContext.user?.email, labels.you)
    )
    .reduce<Record<string, JournalUserBasicDto>>(
      (current, next) => ({ ...current, [next.id]: next }),
      {}
    );

  const accounts = journal.accounts.reduce<
    Record<string, JournalAccountBasicDto>
  >((current, next) => ({ ...current, [next.accountId]: next }), {});

  const groupedByDate = journal.transactions.reduce(
    (txsByDate, tx) => ({
      ...txsByDate,
      [tx.date]: [...(txsByDate[tx.date] ?? []), tx],
    }),
    {} as Record<string, TransactionDetailedDto[]>
  );

  const transactionCommands = [
    viewTransaction(language)(showViewTransactionDialog),
    editTransaction(language)(showEditTransactionDialog),
    deleteTransaction(language)(showDeleteTransactionDialog),
  ];

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: journal.currency,
      }),
    [journal.currency]
  );

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

  return (
    <>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <div className="flex flex-1 gap-2 w-full md:max-w-md">
          <TransactionSearch language={language} handleSearch={handleSearch} />
          <TransactionQuickFilters
            language={language}
            handleFilter={handleQuickFilters}
          />
        </div>

        <Button
          className="w-full md:w-auto gap-0"
          onClick={showNewTransactionDialog}
        >
          <PlusIcon className="w-4 h-4 mr-2" /> {labels.newTransaction}
        </Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg overflow-x-visible">
          {content}
        </DialogContent>
      </Dialog>
      <div>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.125 } }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 gap-2 mb-4"
            >
              <Skeleton className="h-[4rem] w-full col-span-1 rounded-xl" />
              <Skeleton className="h-[4rem] w-full col-span-1 rounded-xl" />
              <Skeleton className="h-[4rem] w-full col-span-1 rounded-xl" />
              <Skeleton className="h-[4rem] w-full col-span-1 rounded-xl" />
              <Skeleton className="h-[4rem] w-full col-span-1 rounded-xl" />
              <Skeleton className="h-[4rem] w-full col-span-1 rounded-xl" />
            </motion.div>
          ) : (
            <motion.div
              key="loaded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.125 } }}
              exit={{ opacity: 0 }}
              className="max-h-[calc(100vh-450px)] overflow-scroll pr-2"
            >
              <div className="space-y-4">
                {Object.entries(groupedByDate).length === 0 && (
                  <p className="opacity-50 italic">{labels.noTransactions}</p>
                )}
                {Object.entries(groupedByDate).map(([date, records]) => (
                  <div key={date} className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      {formatDate(date)}
                    </h3>
                    <div className="space-y-4 mt-2">
                      {records.map((transaction) => (
                        <TransactionItem
                          onClick={() => showViewTransactionDialog(transaction)}
                          key={transaction.id}
                          transaction={{
                            ...transaction,
                            detailedTags: transaction.tags.map(
                              (tag) =>
                                journal.tags.find(({ id }) => id === tag)!
                            ),
                            detailedPaidBy: collaborators[transaction.paidBy],
                            detailedAccount: accounts[transaction.accountId],
                          }}
                          formatter={currencyFormatter}
                          commands={transactionCommands}
                        />
                      ))}
                    </div>
                    <Separator className="mt-4" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
