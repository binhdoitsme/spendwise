"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { JournalDetailedDto } from "@/modules/journals/application/dto/dtos.types";
import { JournalApi } from "@/modules/journals/presentation/api/journal.api";
import { TransactionFormSchema } from "@/modules/journals/presentation/components/forms";
import {
  AccountSelectProps,
  TransactionForm,
} from "@/modules/journals/presentation/components/transaction/transaction-form";
import { TransactionList } from "@/modules/journals/presentation/components/transaction/transaction-list";
import { CalendarIcon, PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
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
}: TransactionTabProps) {
  const [open, setOpen] = useState(false);
  const handleCreateTransaction = async (data: TransactionFormSchema) => {
    await api
      .createTransaction(journal.id, {
        ...data,
        date: data.date.toISOString(),
      })
      .then(() => {
        setOpen(false);
      });
  };

  const handleAddTag = async (tag: string) => {
    try {
      await api.addTags(journal.id, [tag]);
      toast("Successfully added tags");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add tags");
    } finally {
    }
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

  useEffect(() => {
    console.log({ selectableAccounts });
  }, [selectableAccounts]);

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

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto gap-0">
              <PlusIcon className="w-4 h-4 mr-2" /> New Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg overflow-x-visible">
            <DialogHeader>
              <DialogTitle>New Transaction</DialogTitle>
            </DialogHeader>
            <Separator />
            <TransactionForm
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
          </DialogContent>
        </Dialog>
      </div>

      <div className="max-h-[calc(100vh-400px)] overflow-scroll pr-2">
        <TransactionList
          tags={journal.tags}
          transactions={journal.transactions}
          currency={journal.currency}
        />
      </div>
    </>
  );
}
