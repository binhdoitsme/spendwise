"use client";
import { useLoader } from "@/app/loader.context";
import { useI18n } from "@/components/common/i18n";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
import { tagColors } from "@/modules/journals/presentation/components/tag/tag-colors";
import {
  deleteTransaction,
  duplicateTransaction,
  editTransaction,
  viewTransaction,
} from "@/modules/journals/presentation/components/transaction/transaction-commands";
import {
  FilterSchema,
  TransactionQuickFilters,
} from "@/modules/journals/presentation/components/transaction/transaction-filters";
import { AccountSelectProps } from "@/modules/journals/presentation/components/transaction/transaction-form";
import { TransactionItem } from "@/modules/journals/presentation/components/transaction/transaction-item";
import { TransactionSearch } from "@/modules/journals/presentation/components/transaction/transaction-search";
import { ReportsApi } from "@/modules/reports/presentation/contracts/reports.api";
import { convertToCurrentUser } from "@/modules/users/presentation/components/display-user";
import { PlusIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { journalDetailsPageLabels } from "./labels";
import {
  TransactionDialogContent,
  TransactionDialogType,
} from "./transaction-dialogs";
import { AccountSummary } from "@/modules/reports/application/dto/dtos.types";

export interface TransactionTabProps {
  journal: JournalDetailedDto;
  journalApi: JournalApi;
  reportsApi: ReportsApi;
  currentFilters?: Partial<FilterSchema> & { query?: string };
  handleNoAccount: () => void;
  handleRefreshJournal: () => void | Promise<void>;
  handleQuickFilters: (filters: FilterSchema) => Promise<void>;
  handleSearch: (query: string) => Promise<void>;
}

export function TransactionTab({
  journal,
  journalApi,
  reportsApi,
  currentFilters,
  handleNoAccount,
  handleRefreshJournal,
  handleQuickFilters,
  handleSearch,
}: TransactionTabProps) {
  const [open, setOpen] = useState(false);
  const [dialogType, setDialogType] = useState<TransactionDialogType | null>(
    null
  );
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionDetailedDto>();
  const [currentAccountReports, setCurrentAccountReports] =
    useState<AccountSummary>();

  const authContext = useAuthContext();
  const { isLoading } = useLoader();
  const { language } = useI18n();
  const labels = journalDetailsPageLabels[language];

  const colorizedTags = journal.tags.map((tag, index) => ({
    ...tag,
    color: tagColors[index],
  }));

  const handleCreateTransaction = async (data: TransactionFormSchema) => {
    try {
      await journalApi.createTransaction(journal.id, {
        ...data,
        date: data.date.toISOString(),
      });
      await handleRefreshJournal();
      setOpen(false);
      toast(labels.createTransactionSuccess);
    } catch (error) {
      console.error(error);
      toast.error(labels.createTransactionFailed(error));
    }
  };

  const handleDeleteTransaction = async (
    transaction: TransactionDetailedDto
  ) => {
    try {
      await journalApi.deleteTransaction(journal.id, transaction.id!);
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
      await journalApi.addTags(journal.id, [tag]);
      await handleRefreshJournal();
      toast("Successfully added tags");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add tags");
    }
  };

  const handleEditTransaction = async (data: TransactionFormSchema) => {
    try {
      await journalApi.editTransaction(journal.id, data.id!, {
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
    setDialogType("new");
    setOpen(true);
  };

  const showViewTransactionDialog = async (
    transaction: TransactionDetailedDto
  ) => {
    setSelectedTransaction(transaction);
    setDialogType("view");
    setOpen(true);
  };

  const showEditTransactionDialog = async (
    transaction: TransactionDetailedDto
  ) => {
    setSelectedTransaction(transaction);
    setDialogType("edit");
    setOpen(true);
  };

  const showDuplicateTransactionDialog = async (
    transaction: TransactionDetailedDto
  ) => {
    setSelectedTransaction(transaction);
    setDialogType("duplicate");
    setOpen(true);
  };

  const showDeleteTransactionDialog = async (
    transaction: TransactionDetailedDto
  ) => {
    setSelectedTransaction(transaction);
    setDialogType("delete");
    setOpen(true);
  };

  const showAccountReportsDialog = async (accountId: string) => {
    setDialogType("accountReport");
    setOpen(true);
    const reports = await reportsApi.getPaymentSummary({ accountId });
    setCurrentAccountReports(reports);
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
    duplicateTransaction(language)(showDuplicateTransactionDialog),
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
          <TransactionSearch
            language={language}
            handleSearch={handleSearch}
            initValue={currentFilters?.query}
          />
          <TransactionQuickFilters
            language={language}
            initValues={currentFilters}
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
          {dialogType && (
            <TransactionDialogContent
              dialogType={dialogType}
              labels={labels}
              language={language}
              selectableAccounts={selectableAccounts}
              colorizedTags={colorizedTags}
              collaborators={journal.collaborators.map(({ user }) => user)}
              transaction={selectedTransaction}
              accountReports={currentAccountReports}
              onSubmit={
                dialogType === "edit"
                  ? handleEditTransaction
                  : handleCreateTransaction
              }
              onDelete={() =>
                selectedTransaction
                  ? handleDeleteTransaction(selectedTransaction)
                  : Promise.resolve()
              }
              onCancel={() => setOpen(false)}
              onNoAccount={() => {
                setOpen(false);
                setTimeout(() => handleNoAccount?.());
              }}
              onUnknownTag={handleAddTag}
            />
          )}
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
                          onTitleClick={() =>
                            showViewTransactionDialog(transaction)
                          }
                          onAccountClick={() =>
                            showAccountReportsDialog(transaction.accountId)
                          }
                          key={transaction.id}
                          transaction={{
                            ...transaction,
                            detailedTags: transaction.tags.map(
                              (tag) =>
                                colorizedTags.find(({ id }) => id === tag)!
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
