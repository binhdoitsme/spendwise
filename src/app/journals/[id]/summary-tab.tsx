import { useLoader } from "@/app/loader.context";
import { useI18n } from "@/components/common/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CollaboratorBasicDto,
  JournalAccountBasicDto,
} from "@/modules/journals/application/dto/dtos.types";
import { RepaymentForm } from "@/modules/journals/presentation/components/repayment/repayment-form";
import { AccountSelectProps } from "@/modules/journals/presentation/components/transaction/transaction-form";
import type {
  AccountSummaryDto,
  JournalSummaryDto,
} from "@/modules/reports/application/dto/dtos.types";
import { MonthlySummary } from "@/modules/reports/presentation/components/monthly-summary";
import { PaymentDueRow } from "@/modules/reports/presentation/components/payment-due";
import { CalendarClock, Notebook } from "lucide-react";
import { useMemo, useState } from "react";
import { journalDetailsPageLabels } from "./labels";

export function SummaryTab({
  accountSummary,
  monthlySummary,
  journalAccounts,
  journalCollaborators,
  handleNextMonth,
  handlePrevMonth,
  handleRepayment,
}: {
  accountSummary: AccountSummaryDto;
  monthlySummary: JournalSummaryDto;
  journalAccounts: JournalAccountBasicDto[];
  journalCollaborators: CollaboratorBasicDto[];
  handleNextMonth: () => void;
  handlePrevMonth: () => void;
  handleRepayment: ({
    accountId,
    paymentAccountId,
    paymentPaidBy,
    statementMonth,
    date,
  }: {
    accountId: string;
    paymentAccountId: string;
    paymentPaidBy: string;
    statementMonth: string;
    date: Date;
  }) => Promise<void>;
}) {
  const { language } = useI18n();
  const labels = journalDetailsPageLabels[language];
  const { isLoading } = useLoader();
  const [selectedAccountId, setSelectedAccountId] = useState<string>();
  const selectedAccountUpcomingDue = useMemo(
    () =>
      selectedAccountId
        ? accountSummary.upcomingDues.find(
            (item) => item.account.id === selectedAccountId
          )!
        : undefined,
    [selectedAccountId, accountSummary]
  );
  const selectableAccounts = journalAccounts
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

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Notebook className="w-5 h-5" /> {labels.paymentSummary}
        </h2>
      </div>
      <div className="overflow-scroll max-h-[calc(100vh-400px)] space-y-4">
        {monthlySummary && (
          <MonthlySummary
            monthlySummary={monthlySummary}
            isNavigatingMonth={isLoading}
            handleNextMonth={handleNextMonth}
            handlePrevMonth={handlePrevMonth}
          />
        )}
        {!accountSummary?.upcomingDues?.length &&
        !accountSummary?.monthlySpends?.length ? (
          <div className="text-center text-muted-foreground">
            {labels.noCreditOrLoanAccounts}
          </div>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-md flex gap-2 items-center">
                  <CalendarClock /> {labels.upcomingDues}
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="space-y-4">
                {accountSummary?.upcomingDues?.map((item, index) => (
                  <PaymentDueRow
                    key={index}
                    item={item}
                    language={language}
                    handlePayoffButton={() =>
                      setSelectedAccountId(item.account.id)
                    }
                  />
                )) ?? (
                  <Skeleton className="h-[4rem] w-full col-span-1 rounded-xl" />
                )}
                <Dialog
                  open={!!selectedAccountId}
                  onOpenChange={(open) => {
                    if (!open) {
                      setSelectedAccountId(undefined);
                    }
                  }}
                >
                  <DialogContent>
                    <DialogTitle>Thanh toán tín dụng</DialogTitle>
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
                          collaborators={journalCollaborators.map(
                            ({ user }) => user
                          )}
                        />
                      </>
                    )}
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* <Card>
              <CardHeader>
                <CardTitle className="text-md flex items-center gap-2">
                  <ChartNoAxesCombined /> {labels.usageThisMonth(thisMonth)}
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="space-y-4">
                {summary?.monthlySpends?.map((item, index) => (
                  <MonthlyUsage key={index} item={item} language={language} />
                )) ?? (
                  <Skeleton className="h-[4rem] w-full col-span-1 rounded-xl" />
                )}
              </CardContent>
            </Card> */}
          </>
        )}
      </div>
    </div>
  );
}
