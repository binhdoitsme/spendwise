"use client";
import { useI18n } from "@/components/common/i18n";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountBasicDto } from "@/modules/accounts/application/dto/dtos.types";
import { AccountApi } from "@/modules/accounts/presentation/api/account.api";
import { useAuthContext } from "@/modules/auth/presentation/components/auth-context";
import {
  JournalUserBasicDto,
  TransactionDetailedDto,
} from "@/modules/journals/application/dto/dtos.types";
import { JournalApi } from "@/modules/journals/presentation/api/journal.api";
import { Collaborators } from "@/modules/journals/presentation/components/collaborator-avatars";
import { useState } from "react";
import { AccessTab } from "./access-tab";
import { AccountTab } from "./account-tab";
import { useJournalData } from "./hooks";
import { journalDetailsPageLabels } from "./labels";
import { TransactionTabV2 } from "./transaction-tab";

export function FinanceJournalPageContent({
  etag,
  id,
}: {
  etag: string;
  id: string;
}) {
  const authContext = useAuthContext();
  const { language } = useI18n();
  const labels = journalDetailsPageLabels[language];

  // Fetch journal and transactions from indexedDB/cache
  const { journal, transactions } = useJournalData(id, etag);

  // Prepare collaborators as Record<string, JournalUserBasicDto>
  const collaborators: Record<string, JournalUserBasicDto> =
    journal?.collaborators?.reduce((acc, collab) => {
      acc[collab.user.id] = collab.user;
      return acc;
    }, {} as Record<string, JournalUserBasicDto>) ?? {};

  // Owner info
  const owner: JournalUserBasicDto = journal
    ? {
        id: journal.ownerId,
        email: journal.ownerEmail,
        firstName: journal.ownerFirstName,
        lastName: journal.ownerLastName,
      }
    : { id: "", email: "", firstName: "", lastName: "" };

  // Accounts as array
  const accounts = journal?.accounts ?? [];

  // Convert transactions to TransactionDetailedDto[]
  const mappedTransactions: TransactionDetailedDto[] = (transactions ?? []).map(
    (tx) => ({
      ...tx,
      status: tx.status as TransactionDetailedDto["status"],
      type: tx.type as TransactionDetailedDto["type"],
    })
  );

  // myAccounts stub with correct type
  const myAccounts: AccountBasicDto[] = [];

  // Use real API instances or stubs
  const accountApi = {} as AccountApi;
  const journalApi = {} as JournalApi;
  const handleRefreshJournal = () => {};
  const handleRefreshAccounts = () => {};

  // Tab state
  const [currentTab, setCurrentTab] = useState("summary_transactions");

  return (
    <div className="p-6 space-y-6 w-full max-w-[1600px] overflow-auto mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          {labels.title}: {journal?.title}
        </h1>
        <p className="text-muted-foreground">
          {labels.owner}: {owner.firstName} {owner.lastName} ({owner.email})
        </p>
        <div className="mt-1 mb-3">
          <Collaborators
            size="sm"
            collaborators={Object.values(collaborators)}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={currentTab}
        defaultValue="summary_transactions"
        onValueChange={setCurrentTab}
        className="w-full"
      >
        <TabsList className="mb-2 gap-1">
          <TabsTrigger value="summary_transactions">
            {labels.transactions}
          </TabsTrigger>
          <TabsTrigger value="accounts">{labels.accounts}</TabsTrigger>
          <TabsTrigger value="access">{labels.access}</TabsTrigger>
        </TabsList>

        <TabsContent value="summary_transactions">
          {journal && (
            <TransactionTabV2
              journal={journal}
              transactions={mappedTransactions}
              collaborators={collaborators}
              owner={owner}
              language={language}
              labels={labels}
              authContext={authContext}
            />
          )}
        </TabsContent>

        <TabsContent value="accounts">
          {journal && (
            <AccountTab
              accountApi={accountApi}
              journalApi={journalApi}
              journalId={journal.id}
              myAccounts={myAccounts}
              journalAccounts={accounts}
              handleRefreshJournal={handleRefreshJournal}
              handleRefreshAccounts={handleRefreshAccounts}
            />
          )}
        </TabsContent>

        <TabsContent value="access">
          {journal && (
            <AccessTab
              journal={{ ...journal, transactions: mappedTransactions }}
              api={journalApi}
              handleRefreshJournal={handleRefreshJournal}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
