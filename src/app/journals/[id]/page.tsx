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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JournalApi } from "@/modules/journals/presentation/api/journal.api";
import { Collaborators } from "@/modules/journals/presentation/components/collaborator-avatars";
import { Tags } from "@/modules/journals/presentation/components/tag/tag-item";
import {
  AccountSelectProps,
  TransactionForm,
} from "@/modules/journals/presentation/components/transaction/transaction-form";
import { TransactionList } from "@/modules/journals/presentation/components/transaction/transaction-list";
import { TransactionFormSchema } from "@/modules/journals/presentation/components/types";
import { useJournalContext } from "@/modules/journals/presentation/contexts/journal.context";
import { CalendarIcon, PlusIcon } from "lucide-react";
import { useMemo, useState } from "react";

export default function FinanceJournalPage() {
  const [open, setOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<string>("transactions");
  const { journal } = useJournalContext();
  const api = useMemo(() => new JournalApi(), []);

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

  return (
    <div className="p-6 space-y-6 max-w-[800px] max-h-screen mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Finance Journal: {journal.title}</h1>
        <p className="text-muted-foreground">
          Owner: {journal.ownerEmail} ({journal.ownerEmail})
        </p>
        <div className="mt-1 mb-3">
          <Collaborators
            size="sm"
            collaborators={journal.collaborators.map(({ user }) => ({
              id: user.email,
              name: user.fullName,
            }))}
          />
        </div>
        <Tags
          tags={journal.tags}
          handleManageTags={() => setCurrentTab("tags")}
        />
      </div>

      {/* Tabs */}
      <Tabs
        value={currentTab}
        defaultValue="transactions"
        onValueChange={setCurrentTab}
        className="w-full"
      >
        <TabsList className="mb-4 gap-1">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
          <TabsTrigger value="access">Access</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          {/* Toolbar */}
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
                  accounts={journal.accounts
                    .map(({ ownerEmail, accountId }) => ({
                      name: accountId,
                      accountId,
                      ownerEmail,
                    }))
                    .reduce(
                      (prev, next) => ({
                        ...prev,
                        [next.ownerEmail]: [
                          ...(prev[next.ownerEmail] ?? []),
                          { accountId: next.accountId, name: next.accountId },
                        ],
                      }),
                      {} as Record<string, AccountSelectProps[]>
                    )}
                  tags={journal.tags}
                  collaborators={journal.collaborators.map(({ user }) => user)}
                  onSubmit={handleCreateTransaction}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Transactions List */}
          <div className="max-h-[calc(100vh-400px)] overflow-scroll pr-2">
            <TransactionList
              transactions={journal.transactions}
              currency={journal.currency}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
