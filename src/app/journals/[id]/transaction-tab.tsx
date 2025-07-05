import { Language } from "@/components/common/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  JournalAccountBasicDto,
  JournalUserBasicDto,
  TransactionDetailedDto,
} from "@/modules/journals/application/dto/dtos.types";
import { JournalApi } from "@/modules/journals/presentation/api/journal.api";
import { RepaymentForm } from "@/modules/journals/presentation/components/repayment/repayment-form";
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
import {
  AccountSummaryDto,
  JournalSummaryDto,
} from "@/modules/reports/application/dto/dtos.types";
import { MonthlySummary } from "@/modules/reports/presentation/components/monthly-summary";
import { MonthlyUsage } from "@/modules/reports/presentation/components/monthly-usage";
import { PaymentDueRow } from "@/modules/reports/presentation/components/payment-due";
import { ReportsApi } from "@/modules/reports/presentation/contracts/reports.api";
import { IndexedDbJournal } from "@/modules/shared/presentation/components/indexed-db";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Banknote,
  CalendarClock,
  ChartNoAxesCombined,
  Filter,
  Notebook,
  PlusIcon,
} from "lucide-react";
import { DateTime, Interval } from "luxon";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { TransactionDialogContent } from "../transaction-dialogs";
import { useJournalActions, useJournalStates } from "./hooks";
import { JournalDetailsPageLabels } from "./labels";

export function TransactionTabV2({
  journal,
  transactions,
  collaborators,
  language,
  labels,
  journalApi,
  ...props
}: {
  journal: IndexedDbJournal;
  journalApi: JournalApi;
  transactions: TransactionDetailedDto[];
  collaborators: Record<string, JournalUserBasicDto>;
  owner: JournalUserBasicDto;
  language: Language;
  labels: JournalDetailsPageLabels;
  authContext: { user?: { email?: string } };
  accountSummary: AccountSummaryDto;
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
  const {
    open,
    setOpen,
    dialogType,
    setDialogType,
    selectedTransaction,
    actions,
    selectedAccountId,
    setSelectedAccountId,
  } = useJournalActions({
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

  const monthlySummary: JournalSummaryDto = {
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
  };

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
  console.log({ accounts });

  const prevMonth = () => setMonth((month) => month.minus({ months: 1 }));
  const nextMonth = () => setMonth((month) => month.plus({ months: 1 }));

  const [accountSummary, setAccountSummary] = useState(props.accountSummary);
  const selectedAccountUpcomingDue = useMemo(
    () =>
      selectedAccountId
        ? accountSummary.upcomingDues.find(
            (item) => item.account.id === selectedAccountId
          )!
        : undefined,
    [selectedAccountId, accountSummary]
  );

  const reportsApi = useMemo(() => new ReportsApi(), []);
  const [currentAccountReports, setCurrentAccountReports] =
    useState<AccountSummaryDto>();

  const [accountReportsCache, setAccountReportsCache] = useState<{
    [key: string]: AccountSummaryDto;
  }>({});

  useEffect(() => {
    setCurrentAccountReports(undefined);
    if (selectedAccountId && !(selectedAccountId in accountReportsCache)) {
      reportsApi
        .getPaymentSummary({ accountId: selectedAccountId })
        .then((reports) => {
          setCurrentAccountReports(reports);
          setAccountReportsCache((current) => ({
            ...current,
            [selectedAccountId]: reports,
          }));
        });
    } else if (selectedAccountId) {
      setCurrentAccountReports(accountReportsCache[selectedAccountId]);
    }
  }, [accountReportsCache, selectedAccountId, reportsApi]);

  const now = DateTime.now();
  const thisMonth = now.startOf("month");

  const accountFilterSchema = z.object({ accountId: z.string().optional() });
  const accountFilterForm = useForm<z.infer<typeof accountFilterSchema>>({
    resolver: zodResolver(accountFilterSchema),
  });
  const filteredAccountId = accountFilterForm.watch("accountId");
  // Filter groupedByDate's values by filteredAccountId
  const filteredGroupedByDate = useMemo(() => {
    if (!filteredAccountId) return groupedByDate;
    const result: typeof groupedByDate = {};
    Object.entries(groupedByDate).forEach(([date, records]) => {
      const filteredRecords = records.filter(
        (tx) => tx.accountId === filteredAccountId
      );
      if (filteredRecords.length > 0) {
        result[date] = filteredRecords;
      }
    });
    return result;
  }, [groupedByDate, filteredAccountId]);

  const handleRepayment = async ({
    accountId,
    statementMonth,
    date,
  }: {
    accountId: string;
    paymentAccountId: string;
    paymentPaidBy: string;
    statementMonth: string;
    date: Date;
  }) => {
    try {
      await journalApi.createRepayment({
        journalId: journal.id,
        accountId,
        paymentDate: DateTime.fromJSDate(date, { zone: "utc" }).toISODate()!,
        statementMonth,
      });
      setAccountSummary((summary) => {
        const updatedAccountDueIndex = summary.upcomingDues.findIndex(
          (due) =>
            due.account.id === accountId &&
            due.statementMonth === statementMonth
        );
        return {
          ...summary,
          upcomingDues: [
            ...summary.upcomingDues.slice(0, updatedAccountDueIndex),
            {
              ...summary.upcomingDues[updatedAccountDueIndex],
              isPaidOff: true,
            },
            ...summary.upcomingDues.slice(updatedAccountDueIndex + 1),
          ],
        };
      });
      toast("Successfully paid off!");
    } catch (e) {
      toast.error(`Error ${e}`);
      throw e;
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:max-h-screen">
      <div className="flex-1 py-2 px-4 gap-4 flex flex-col overflow-y-scroll">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Notebook className="w-5 h-5" /> {labels.paymentSummary}
          </h2>
        </div>
        {journal && (
          <MonthlySummary
            monthlySummary={monthlySummary}
            handleNextMonth={nextMonth}
            handlePrevMonth={prevMonth}
            isNavigatingMonth={false}
          />
        )}
        {!accountSummary?.upcomingDues?.length &&
        !accountSummary?.monthlySpends?.length ? (
          <div className="text-center text-muted-foreground">
            {labels.noCreditOrLoanAccounts}
          </div>
        ) : (
          <>
            <Card className="gap-3">
              <CardHeader>
                <CardTitle className="text-md flex gap-2 items-center">
                  <CalendarClock /> {labels.upcomingDues}
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="space-y-4">
                {accountSummary?.upcomingDues
                  ?.filter(
                    ({ statementPeriod: { start, end } }) =>
                      !Interval.fromDateTimes(
                        DateTime.fromISO(start),
                        DateTime.fromISO(end)
                      ).contains(now)
                  )
                  ?.map((item, index) => (
                    <PaymentDueRow
                      key={index}
                      item={item}
                      language={language}
                      handlePayoffButton={() => {
                        setSelectedAccountId(item.account.id);
                        setDialogType("repayment");
                      }}
                    />
                  )) ?? (
                  <Skeleton className="h-[4rem] w-full col-span-1 rounded-xl" />
                )}
                <Dialog
                  open={!!selectedAccountId && dialogType === "repayment"}
                  onOpenChange={(open) => {
                    if (!open) {
                      setSelectedAccountId(undefined);
                    }
                  }}
                >
                  <DialogContent>
                    <DialogTitle>{labels.creditRepayment}</DialogTitle>
                    {selectedAccountId && selectedAccountUpcomingDue && (
                      <>
                        <PaymentDueRow
                          format="compact"
                          item={selectedAccountUpcomingDue}
                          language={language}
                        />
                        <RepaymentForm
                          language={language}
                          statementMonth={
                            selectedAccountUpcomingDue.statementMonth
                          }
                          accountId={selectedAccountId}
                          handleCreateRepayment={async (payload) => {
                            try {
                              await handleRepayment(payload);
                              setSelectedAccountId(undefined);
                            } catch {}
                          }}
                          accounts={selectableAccounts}
                          collaborators={journal.collaborators.map(
                            ({ user }) => user
                          )}
                        />
                      </>
                    )}
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card className="gap-3">
              <CardHeader>
                <CardTitle className="text-md flex items-center gap-2">
                  <ChartNoAxesCombined />{" "}
                  {labels.usageThisMonth(
                    thisMonth.setLocale(language).toLocaleString({
                      month: "long",
                      year: "numeric",
                    })
                  )}
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="space-y-4">
                {accountSummary?.monthlySpends
                  ?.filter(({ month }) => {
                    const monthStart = DateTime.fromISO(month);
                    const monthPeriod = Interval.fromDateTimes(
                      monthStart,
                      monthStart.plus({ months: 1 })
                    );
                    return monthPeriod.contains(now);
                  })
                  .map((item, index) => (
                    <MonthlyUsage key={index} item={item} language={language} />
                  )) ?? (
                  <Skeleton className="h-[4rem] w-full col-span-1 rounded-xl" />
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
      <div className="flex-1 py-2 px-4 flex flex-col gap-4 overflow-y-scroll">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Banknote className="w-5 h-5" /> {labels.transactions}
          </h2>
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-start md:items-center justify-between gap-4 mb-4">
            <div className="flex flex-1 gap-2 w-full md:max-w-md">
              <TransactionSearch
                language={language}
                handleSearch={async (q) => setQuery(q)}
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <Filter />
                    Filter by Account
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 space-y-3" align="end">
                  <div>
                    <h3>Filter by account</h3>
                  </div>
                  <Form {...accountFilterForm}>
                    <form
                      onSubmit={accountFilterForm.handleSubmit(() =>
                        accountFilterForm.setValue("accountId", undefined)
                      )}
                    >
                      <FormField
                        name="accountId"
                        control={accountFilterForm.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <RadioGroup
                                value={field.value}
                                onValueChange={field.onChange}
                                className="flex flex-col gap-3"
                              >
                                {Object.values(accounts).map((acc) => (
                                  <div
                                    key={acc.accountId}
                                    className="flex gap-3"
                                  >
                                    <RadioGroupItem
                                      id={acc.accountId}
                                      value={acc.accountId}
                                    />
                                    <FormLabel
                                      htmlFor={acc.accountId}
                                      className="font-normal"
                                    >
                                      {acc.displayName}
                                    </FormLabel>
                                  </div>
                                ))}
                              </RadioGroup>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <Button variant="outline" type="submit">
                          Clear
                        </Button>
                      </div>
                    </form>
                  </Form>
                </PopoverContent>
              </Popover>
            </div>

            <Button
              className="gap-0"
              onClick={actions.showNewTransactionDialog}
            >
              <PlusIcon className="w-4 h-4 mr-2" /> {labels.newTransaction}
            </Button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
            {transactionsThisMonth.length === 0 && (
              <p className="opacity-50 italic">{labels.noTransactions}</p>
            )}
            {Object.keys(filteredGroupedByDate).length === 0 &&
              transactionsThisMonth.length > 0 && (
                <p className="opacity-50 italic">
                  {labels.noMatchedTransactions}
                </p>
              )}
            {Object.entries(filteredGroupedByDate).map(([date, records]) => (
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
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg overflow-x-visible">
          {dialogType && (
            <TransactionDialogContent
              accountReports={currentAccountReports}
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
  );
}
