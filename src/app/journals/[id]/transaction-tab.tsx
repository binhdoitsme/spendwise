import { Language } from "@/components/common/i18n";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  JournalAccountBasicDto,
  JournalUserBasicDto,
  TransactionDetailedDto,
} from "@/modules/journals/application/dto/dtos.types";
import { tagColors } from "@/modules/journals/presentation/components/tag/tag-colors";
import {
  deleteTransaction,
  duplicateTransaction,
  editTransaction,
  viewTransaction,
} from "@/modules/journals/presentation/components/transaction/transaction-commands";
import { AccountSelectProps } from "@/modules/journals/presentation/components/transaction/transaction-form";
import { TransactionItem } from "@/modules/journals/presentation/components/transaction/transaction-item";
import { TransactionSearch } from "@/modules/journals/presentation/components/transaction/transaction-search";
import { MonthlySummary } from "@/modules/reports/presentation/components/monthly-summary";
import { IndexedDbJournal } from "@/modules/shared/presentation/components/indexed-db";
import { Banknote, Notebook, PlusIcon } from "lucide-react";
import { DateTime } from "luxon";
import { useState } from "react";
import { TransactionDialogContent } from "../transaction-dialogs";
import { useJournalActions, useJournalStates } from "./hooks";
import { JournalDetailsPageLabels } from "./labels";

export function TransactionTabV2({
  journal,
  transactions,
  collaborators,
  language,
  labels,
}: {
  journal: IndexedDbJournal;
  transactions: TransactionDetailedDto[];
  collaborators: Record<string, JournalUserBasicDto>;
  owner: JournalUserBasicDto;
  language: Language;
  labels: JournalDetailsPageLabels;
  authContext: { user?: { email?: string } };
}) {
  const [month, setMonth] = useState(DateTime.now().startOf("month"));
  const {
    groupedByDate,
    currencyFormatter,
    spentThisMonth,
    spentChange,
    transactionsByAccount,
    formatDate,
    setQuery,
    transactionsThisMonth,
  } = useJournalStates({
    journal,
    transactions: transactions.map((tx) => ({ ...tx, journalId: journal.id })),
    month,
    language,
  });
  const { open, setOpen, dialogType, selectedTransaction, actions } =
    useJournalActions({
      journal,
      labels: labels as unknown as Record<string, string>,
    });

  const selectableAccounts =
    journal?.accounts
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
      ) ?? {};

  const transactionCommands = [
    viewTransaction(language)(actions.showViewTransactionDialog),
    editTransaction(language)(actions.showEditTransactionDialog),
    duplicateTransaction(language)(actions.showDuplicateTransactionDialog),
    deleteTransaction(language)(actions.showDeleteTransactionDialog),
  ];

  const colorizedTags = journal?.tags?.map((tag, index) => ({
    ...tag,
    color: tagColors[index % tagColors.length],
  }));

  const accounts = journal?.accounts.reduce<
    Record<string, JournalAccountBasicDto>
  >((current, next) => ({ ...current, [next.accountId]: next }), {});

  const prevMonth = () => setMonth((month) => month.minus({ months: 1 }));
  const nextMonth = () => setMonth((month) => month.plus({ months: 1 }));

  return (
    <div className="h-auto md:h-[calc(100vh-4rem)] w-full flex flex-col md:flex-row overflow-scroll md:overflow-hidden py-2">
      <div className="w-full md:w-1/2 py-2 px-4 flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Notebook className="w-5 h-5" /> {labels.paymentSummary}
          </h2>
        </div>
        {journal && (
          <MonthlySummary
            monthlySummary={{
              month: month.toFormat("yyyyMM"),
              totalSpent: spentThisMonth,
              spentChange,
              spendingTags: Object.values(
                transactionsThisMonth
                  .flatMap((t) =>
                    t.tags.map((tag) => ({
                      name:
                        tag.length > 0
                          ? tag.charAt(0).toLocaleUpperCase(language) +
                            tag.slice(1).replace("-", " ")
                          : tag,
                      amount: t.amount,
                    }))
                  )
                  .reduce<Record<string, { name: string; amount: number }>>(
                    (acc, curr) => {
                      if (acc[curr.name]) {
                        acc[curr.name].amount += curr.amount;
                      } else {
                        acc[curr.name] = { ...curr };
                      }
                      return acc;
                    },
                    {}
                  )
              )
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 5),
              accounts: transactionsByAccount,
              currency: journal.currency,
            }}
            handleNextMonth={nextMonth}
            handlePrevMonth={prevMonth}
            isNavigatingMonth={false}
          />
        )}
      </div>
      <div className="w-full md:w-1/2 py-2 px-4 flex flex-col gap-4 md:h-full md:min-h-0">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Banknote className="w-5 h-5" /> {labels.transactions}
          </h2>
        </div>
        <div className="flex-1 flex flex-col md:min-h-0">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div className="flex flex-1 gap-2 w-full md:max-w-md">
              <TransactionSearch
                language={language}
                handleSearch={async (q) => setQuery(q)}
              />
            </div>

            <Button
              className="w-full md:w-auto gap-0"
              onClick={actions.showNewTransactionDialog}
            >
              <PlusIcon className="w-4 h-4 mr-2" /> {labels.newTransaction}
            </Button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto space-y-4 md:min-h-0">
            {transactionsThisMonth.length === 0 && (
              <p className="opacity-50 italic">{labels.noTransactions}</p>
            )}
            {Object.keys(groupedByDate).length === 0 &&
              transactionsThisMonth.length > 0 && (
                <p className="opacity-50 italic">
                  {labels.noMatchedTransactions}
                </p>
              )}
            {Object.entries(groupedByDate).map(([date, records]) => (
              <div key={date} className="space-y-3 w-full">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  {formatDate(date)}
                </h3>
                <div className="space-y-4 mt-2">
                  {records.map((transaction) => (
                    <TransactionItem
                      key={transaction.id}
                      onTitleClick={() =>
                        actions.showViewTransactionDialog(
                          transaction as unknown as TransactionDetailedDto
                        )
                      }
                      onAccountClick={() =>
                        actions.showAccountReportsDialog(transaction.accountId)
                      }
                      formatter={currencyFormatter}
                      commands={transactionCommands}
                      transaction={{
                        ...transaction,
                        status:
                          transaction.status as TransactionDetailedDto["status"],
                        detailedTags: transaction.tags
                          .map(
                            (tag) =>
                              colorizedTags!.find(({ id }) => id === tag)!
                          )
                          .filter(Boolean),
                        detailedPaidBy: collaborators[transaction.paidBy],
                        detailedAccount: accounts[transaction.accountId],
                      }}
                    />
                  ))}
                </div>
                <Separator className="mt-4" />
              </div>
            ))}
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-lg overflow-x-visible">
            {dialogType && (
              <TransactionDialogContent
                dialogType={dialogType}
                labels={labels}
                language={language}
                selectableAccounts={selectableAccounts}
                colorizedTags={colorizedTags ?? []}
                collaborators={
                  journal?.collaborators.map(({ user }) => user) ?? []
                }
                transaction={selectedTransaction as TransactionDetailedDto}
                onSubmit={
                  dialogType === "edit"
                    ? actions.handleEditTransaction
                    : actions.handleCreateTransaction
                }
                onDelete={() =>
                  selectedTransaction
                    ? actions.handleDeleteTransaction(
                        selectedTransaction as TransactionDetailedDto
                      )
                    : Promise.resolve()
                }
                onCancel={() => setOpen(false)}
                onNoAccount={() => {
                  setOpen(false);
                  // setTimeout(() => handleNoAccount?.());
                }}
                onUnknownTag={actions.handleAddTag}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
