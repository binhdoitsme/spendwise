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
import { convertToCurrentUser } from "@/modules/users/presentation/components/display-user";
import { useAuthContext } from "@/modules/auth/presentation/components/auth-context";
import { useI18n } from "@/components/common/i18n";
import { journalDetailsPageLabels } from "./labels";

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

  const authContext = useAuthContext();
  const { language } = useI18n();
  const labels = journalDetailsPageLabels[language];
  const owner = convertToCurrentUser(
    {
      firstName: journal.ownerFirstName,
      lastName: journal.ownerLastName,
      email: journal.ownerEmail,
    },
    authContext.user?.email,
    labels.you
  );

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
        <h1 className="text-2xl font-bold">
          {labels.title}: {journal.title}
        </h1>
        <p className="text-muted-foreground">
          {labels.owner}: {owner.firstName} {owner.lastName} (
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
          <TabsTrigger value="transactions">{labels.transactions}</TabsTrigger>
          <TabsTrigger value="accounts">{labels.accounts}</TabsTrigger>
          <TabsTrigger value="access">{labels.access}</TabsTrigger>
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
