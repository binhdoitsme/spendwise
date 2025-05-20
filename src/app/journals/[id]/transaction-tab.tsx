"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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
  AccountSelectProps,
  TransactionForm,
} from "@/modules/journals/presentation/components/transaction/transaction-form";
import { TransactionItem } from "@/modules/journals/presentation/components/transaction/transaction-item";
import { CalendarIcon, PlusIcon } from "lucide-react";
import { ReactNode, useMemo, useState } from "react";
import { toast } from "sonner";

export interface TransactionTabProps {
  journal: JournalDetailedDto;
  api: JournalApi;
  handleNoAccount: () => void;
  handleRefreshJournal: () => void | Promise<void>;
}

export function TransactionTab({
  journal,
  api,
  handleNoAccount,
  handleRefreshJournal,
}: TransactionTabProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState<ReactNode | null>(null);

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
          <DialogTitle>New Transaction</DialogTitle>
        </DialogHeader>
        <Separator />
        <TransactionForm
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
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>
        <TransactionForm
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
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>
        <TransactionForm
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
    console.log({ transaction });
    setContent(
      <>
        <DialogHeader>
          <DialogTitle>Confirm deletion</DialogTitle>
        </DialogHeader>
        <p>Are you sure want to delete this transaction?</p>
        <div className="space-x-2">
          <Button variant="destructive">Yes</Button>
          <Button variant="secondary">No</Button>
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
    .map(({ user }) => user)
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

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: journal.currency,
      }),
    [journal.currency]
  );

  return (
    <>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <div className="flex flex-1 gap-2 w-full md:max-w-md">
          <Input placeholder="Search..." />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                All <CalendarIcon className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>This Month</DropdownMenuItem>
              <DropdownMenuItem>Last Month</DropdownMenuItem>
              <DropdownMenuItem>This Year</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button
          className="w-full md:w-auto gap-0"
          onClick={showNewTransactionDialog}
        >
          <PlusIcon className="w-4 h-4 mr-2" /> New Transaction
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-lg overflow-x-visible">
            {content}
          </DialogContent>
        </Dialog>
      </div>

      <div className="max-h-[calc(100vh-400px)] overflow-scroll pr-2">
        <div className="space-y-4">
          {Object.entries(groupedByDate).length === 0 && (
            <p className="opacity-50 italic">
              It&apos;s empty here. Click + New Transaction to start recording
              your expenses!
            </p>
          )}
          {Object.entries(groupedByDate).map(([date, records]) => (
            <div key={date} className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">
                {new Date(date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              <div className="space-y-4 mt-2">
                {records.map((transaction) => (
                  <TransactionItem
                    onClick={() => showViewTransactionDialog(transaction)}
                    key={transaction.id}
                    transaction={{
                      ...transaction,
                      detailedTags: transaction.tags.map(
                        (tag) => journal.tags.find(({ id }) => id === tag)!
                      ),
                      detailedPaidBy: collaborators[transaction.paidBy],
                      detailedAccount: accounts[transaction.accountId],
                    }}
                    formatter={formatter}
                    commands={[
                      viewTransaction(showViewTransactionDialog),
                      editTransaction(showEditTransactionDialog),
                      deleteTransaction(showDeleteTransactionDialog),
                    ]}
                  />
                ))}
              </div>
              <Separator className="mt-4" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
