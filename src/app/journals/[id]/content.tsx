"use client";
import { useLoader } from "@/app/loader.context";
import { useI18n } from "@/components/common/i18n";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountBasicDto } from "@/modules/accounts/application/dto/dtos.types";
import { AccountApi } from "@/modules/accounts/presentation/api/account.api";
import { useAuthContext } from "@/modules/auth/presentation/components/auth-context";
import {
  JournalDetailedDto,
  TransactionDetailedDto,
} from "@/modules/journals/application/dto/dtos.types";
import { JournalApi } from "@/modules/journals/presentation/api/journal.api";
import { Collaborators } from "@/modules/journals/presentation/components/collaborator-avatars";
import { tagColors } from "@/modules/journals/presentation/components/tag/tag-colors";
import { Tags } from "@/modules/journals/presentation/components/tag/tag-item";
import { FilterSchema } from "@/modules/journals/presentation/components/transaction/transaction-filters";
import { AccountSummary } from "@/modules/reports/application/dto/dtos.types";
import { ReportsApi } from "@/modules/reports/presentation/contracts/reports.api";
import { convertToCurrentUser } from "@/modules/users/presentation/components/display-user";
import { DateTime } from "luxon";
import { useMemo, useState } from "react";
import { AccessTab } from "./access-tab";
import { AccountTab } from "./account-tab";
import { journalDetailsPageLabels } from "./labels";
import { SummaryTab } from "./summary-tab";
import { TransactionTab } from "./transaction-tab";

export interface FinanceJournalPageContentProps {
  journal: JournalDetailedDto;
  myAccounts: AccountBasicDto[];
  accountSummary: AccountSummary;
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

export function FinanceJournalPageContent(
  props: FinanceJournalPageContentProps
) {
  const [currentTab, setCurrentTab] = useState("summary");
  const [journal, setJournal] = useState(props.journal);
  const [myAccounts, setMyAccounts] = useState(props.myAccounts);
  const [accountSummary, setAccountSummary] = useState(props.accountSummary);
  const [currentFilters, setFilters] = useState<
    Partial<FilterSchema> & { query?: string }
  >();

  const journalApi = useMemo(() => new JournalApi(), []);
  const accountApi = useMemo(() => new AccountApi(), []);
  const reportsApi = useMemo(() => new ReportsApi(), []);

  const authContext = useAuthContext();
  const { loadingStart, loadingEnd } = useLoader();
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
  const colorizedTags = journal.tags.map((tag, index) => ({
    ...tag,
    color: tagColors[index],
  }));

  const handleRefreshJournal = async () => {
    const dateRange = currentFilters ? toDateRange(currentFilters) : undefined;
    const now = DateTime.now();
    const recent2Months = {
      start: now.startOf("month").minus({ months: 1 }).toISODate(),
      end: now.endOf("month").toISODate(),
    };
    console.log({ recent2Months });
    const [refreshedJournal, refreshedAccountSummary, refreshedTransactions] =
      await Promise.all([
        journalApi.getJournalById(props.journal.id),
        reportsApi.getPaymentSummary({
          journalId: props.journal.id,
          period: recent2Months,
          accountTypes: ["credit", "loan"],
        }),
        journalApi.listTransactions(journal.id, {
          creditOnly: currentFilters?.showCredit,
          dateRange: dateRange,
          query: currentFilters?.query,
        }),
      ]);
    setJournal({ ...refreshedJournal, transactions: refreshedTransactions });
    setAccountSummary(refreshedAccountSummary);
  };

  const handleRefreshAccounts = async () => {
    const refreshedAccountList = await accountApi.listAccounts();
    setMyAccounts(refreshedAccountList);
  };

  const refreshTransactionList = async (
    transactions: TransactionDetailedDto[]
  ) => {
    setJournal({ ...journal, transactions });
  };

  const handleQuickFilters = async (filters: FilterSchema) => {
    loadingStart();
    const dateRange = toDateRange(filters);
    const transactions = await journalApi.listTransactions(journal.id, {
      creditOnly: filters.showCredit,
      dateRange: dateRange,
      query: currentFilters?.query,
    });
    await refreshTransactionList(transactions);
    setFilters({ ...currentFilters, ...filters });
    loadingEnd();
  };

  const handleSearch = async (query: string) => {
    loadingStart();
    const dateRange = currentFilters ? toDateRange(currentFilters) : undefined;
    const transactions = await journalApi.listTransactions(journal.id, {
      creditOnly: currentFilters?.showCredit,
      dateRange: dateRange,
      query,
    });
    await refreshTransactionList(transactions);
    setFilters({ ...currentFilters, query });
    loadingEnd();
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
        <Tags tags={colorizedTags} />
      </div>

      {/* Tabs */}
      <Tabs
        value={currentTab}
        // defaultValue="transactions"
        defaultValue="summary"
        onValueChange={setCurrentTab}
        className="w-full"
      >
        <TabsList className="mb-2 gap-1">
          <TabsTrigger value="summary">{labels.summary}</TabsTrigger>
          <TabsTrigger value="transactions">{labels.transactions}</TabsTrigger>
          <TabsTrigger value="accounts">{labels.accounts}</TabsTrigger>
          <TabsTrigger value="access">{labels.access}</TabsTrigger>
          {/* <TabsTrigger value="settings">Settings</TabsTrigger> */}
        </TabsList>

        <TabsContent value="summary">
          <SummaryTab accountSummary={accountSummary} />
        </TabsContent>

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
            journal={journal}
            journalApi={journalApi}
            reportsApi={reportsApi}
            currentFilters={currentFilters}
            handleSearch={handleSearch}
            handleQuickFilters={handleQuickFilters}
            handleRefreshJournal={handleRefreshJournal}
            handleNoAccount={() => setCurrentTab("accounts")}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
