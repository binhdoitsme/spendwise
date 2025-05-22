"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountBasicDto } from "@/modules/accounts/application/dto/dtos.types";
import { AccountApi } from "@/modules/accounts/presentation/api/account.api";
import {
  JournalDetailedDto,
  TransactionDetailedDto,
} from "@/modules/journals/application/dto/dtos.types";
import { JournalApi } from "@/modules/journals/presentation/api/journal.api";
import { Collaborators } from "@/modules/journals/presentation/components/collaborator-avatars";
import { Tags } from "@/modules/journals/presentation/components/tag/tag-item";
import { useMemo, useState } from "react";
import { AccessTab } from "./access-tab";
import { AccountTab } from "./account-tab";
import { TransactionTab } from "./transaction-tab";

export interface FinanceJournalPageContentProps {
  journal: JournalDetailedDto;
  myAccounts: AccountBasicDto[];
}

export function FinanceJournalPageContent(
  props: FinanceJournalPageContentProps
) {
  const [currentTab, setCurrentTab] = useState("transactions");
  const [journal, setJournal] = useState(props.journal);
  const [myAccounts, setMyAccounts] = useState(props.myAccounts);

  const journalApi = useMemo(() => new JournalApi(), []);
  const accountApi = useMemo(() => new AccountApi(), []);

  const handleRefreshJournal = async () => {
    const refreshedJournal = await journalApi.getJournalById(props.journal.id);
    setJournal(refreshedJournal);
  };

  const handleRefreshAccounts = async () => {
    const refreshedAccountList = await accountApi.listAccounts();
    setMyAccounts(refreshedAccountList);
  };

  const handleRefreshTransactionList = async (
    transactions: TransactionDetailedDto[]
  ) => {
    setJournal({ ...journal, transactions });
  };

  return (
    <div className="p-6 space-y-6 max-w-[1000px] max-h-screen mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Finance Journal: {journal.title}</h1>
        <p className="text-muted-foreground">
          Owner: {journal.ownerFirstName} {journal.ownerLastName} (
          {journal.ownerEmail})
        </p>
        <div className="mt-1 mb-3">
          <Collaborators
            size="sm"
            collaborators={journal.collaborators.map(({ user }) => ({
              id: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
            }))}
          />
        </div>
        <Tags tags={journal.tags} />
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
          <TabsTrigger value="access">Access</TabsTrigger>
          {/* <TabsTrigger value="settings">Settings</TabsTrigger> */}
        </TabsList>

        <TabsContent value="accounts">
          <AccountTab
            accountApi={accountApi}
            journalApi={journalApi}
            journalId={journal.id}
            myAccounts={myAccounts}
            journalAccounts={journal.accounts}
            handleRefreshJournal={handleRefreshJournal}
            handleRefreshAccounts={handleRefreshAccounts}
          />
        </TabsContent>

        <TabsContent value="access">
          <AccessTab
            journal={journal}
            api={journalApi}
            handleRefreshJournal={handleRefreshJournal}
          />
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionTab
            api={journalApi}
            journal={journal}
            handleRefreshTransactionList={handleRefreshTransactionList}
            handleRefreshJournal={handleRefreshJournal}
            handleNoAccount={() => setCurrentTab("accounts")}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
