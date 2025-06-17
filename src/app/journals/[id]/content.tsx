"use client";
import { useLoader } from "@/app/loader.context";
import { useI18n } from "@/components/common/i18n";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountBasicDto } from "@/modules/accounts/application/dto/dtos.types";
import { AccountApi } from "@/modules/accounts/presentation/api/account.api";
import { JournalAggregateApi } from "@/modules/aggregations/presentation/contracts/journal-reports.api";
import { useAuthContext } from "@/modules/auth/presentation/components/auth-context";
import { JournalDetailedDto } from "@/modules/journals/application/dto/dtos.types";
import { JournalApi } from "@/modules/journals/presentation/api/journal.api";
import { Collaborators } from "@/modules/journals/presentation/components/collaborator-avatars";
import { FilterSchema } from "@/modules/journals/presentation/components/transaction/transaction-filters";
import {
  AccountSummaryDto,
  JournalSummaryDto,
} from "@/modules/reports/application/dto/dtos.types";
import { ReportsApi } from "@/modules/reports/presentation/contracts/reports.api";
import { convertToCurrentUser } from "@/modules/users/presentation/components/display-user";
import { DateTime } from "luxon";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AccessTab } from "./access-tab";
import { AccountTab } from "./account-tab";
import { journalDetailsPageLabels } from "./labels";
import { SummaryTab } from "./summary-tab";
import { TransactionTab } from "./transaction-tab";

export interface FinanceJournalPageContentProps {
  journal: JournalDetailedDto;
  myAccounts: AccountBasicDto[];
  accountSummary: AccountSummaryDto;
  month: string;
  journalSummary: JournalSummaryDto;
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
  const [currentTab, setCurrentTab] = useState("summary_transactions");
  const [journal, setJournal] = useState(props.journal);
  const [myAccounts, setMyAccounts] = useState(props.myAccounts);
  const [accountSummary, setAccountSummary] = useState(props.accountSummary);
  const [month, setMonth] = useState(
    DateTime.fromFormat(props.month, "yyyyMM")
  );
  const [journalSummary, setJournalSummary] = useState(props.journalSummary);
  const [currentFilters, setFilters] = useState<
    Partial<FilterSchema> & { query?: string }
  >();

  const journalApi = useMemo(() => new JournalApi(), []);
  const accountApi = useMemo(() => new AccountApi(), []);
  const journalReportApi = useMemo(() => new JournalAggregateApi(), []);
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

  const handleRefreshJournal = async () => {
    // console.trace("Here");
    loadingStart();
    const {
      journal: refreshedJournal,
      accountSummary: refreshedAccountSummary,
      journalSummary: refreshedJournalSummary,
    } = await journalReportApi.getAggregatedJournal({
      journalId: journal.id,
      month: month.toFormat("yyyyMM"),
      creditOnly: currentFilters?.showCredit,
      query: currentFilters?.query,
      today: DateTime.now().toISODate(),
    });
    setJournal(refreshedJournal);
    setAccountSummary(refreshedAccountSummary);
    setJournalSummary(refreshedJournalSummary);
    loadingEnd();
  };

  const handleRefreshAccounts = async () => {
    const refreshedAccountList = await accountApi.listAccounts();
    setMyAccounts(refreshedAccountList);
  };

  const handleQuickFilters = async (filters: FilterSchema) => {
    loadingStart();
    const dateRange = toDateRange(filters);
    const transactions = await journalApi.listTransactions(journal.id, {
      creditOnly: filters.showCredit,
      dateRange: dateRange,
      query: currentFilters?.query,
    });
    setJournal({ ...journal, transactions });
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
    setJournal({ ...journal, transactions });
    setFilters({ ...currentFilters, query });
    loadingEnd();
  };

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

  useEffect(() => {
    (async () => {
      loadingStart();
      const {
        journal: refreshedJournal,
        accountSummary: refreshedAccountSummary,
        journalSummary: refreshedJournalSummary,
      } = await journalReportApi.getAggregatedJournal({
        journalId: journal.id,
        today: DateTime.now().toISODate(),
        month: month.toFormat("yyyyMM"),
        creditOnly: currentFilters?.showCredit,
        query: currentFilters?.query,
      });
      setJournal(refreshedJournal);
      setAccountSummary(refreshedAccountSummary);
      setJournalSummary(refreshedJournalSummary);
      loadingEnd();
    })();
  }, [
    currentFilters,
    month,
    journal.id,
    journalReportApi,
    loadingStart,
    loadingEnd,
  ]);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] max-h-screen mx-auto">
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
        {/* <Tags tags={colorizedTags} /> */}
      </div>

      {/* Tabs */}
      <Tabs
        value={currentTab}
        // defaultValue="transactions"
        defaultValue="summary_transactions"
        onValueChange={setCurrentTab}
        className="w-full"
      >
        <TabsList className="mb-2 gap-1">
          {/* <TabsTrigger value="summary">{labels.summary}</TabsTrigger> */}
          <TabsTrigger value="summary_transactions">
            {labels.transactions}
          </TabsTrigger>
          <TabsTrigger value="accounts">{labels.accounts}</TabsTrigger>
          <TabsTrigger value="access">{labels.access}</TabsTrigger>
          {/* <TabsTrigger value="settings">Settings</TabsTrigger> */}
        </TabsList>

        <TabsContent value="summary_transactions">
          <div className="grid grid-cols-11">
            <div className="col-span-5 pr-4 border-r">
              <SummaryTab
                accountSummary={accountSummary}
                monthlySummary={journalSummary}
                handleNextMonth={() =>
                  setMonth((month) => month.plus({ months: 1 }))
                }
                handlePrevMonth={() =>
                  setMonth((month) => month.minus({ months: 1 }))
                }
                handleRepayment={handleRepayment}
                journalAccounts={journal.accounts}
                journalCollaborators={journal.collaborators}
              />
            </div>
            <div className="col-span-6 pl-4 border-l">
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
            </div>
          </div>
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
      </Tabs>
    </div>
  );
}
