import { useLoader } from "@/app/loader.context";
import { useI18n } from "@/components/common/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  AccountSummaryDto,
  JournalSummaryDto,
} from "@/modules/reports/application/dto/dtos.types";
import { MonthlySummary } from "@/modules/reports/presentation/components/monthly-summary";
import { PaymentDueRow } from "@/modules/reports/presentation/components/payment-due";
import { ReportsApi } from "@/modules/reports/presentation/contracts/reports.api";
import { CalendarClock, Notebook } from "lucide-react";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { journalDetailsPageLabels } from "./labels";

// const getThisMonth = (date: Date, language: string) => {
//   switch (language) {
//     case "vi":
//       return date.toLocaleDateString("vi-VN", {
//         month: "long",
//         year: "numeric",
//       });
//     default:
//       return date.toLocaleDateString("en-US", {
//         month: "long",
//         year: "numeric",
//       });
//   }
// };

// const capitalize = (value: string) =>
//   value.slice(0, 1).toUpperCase() + value.slice(1);

export function SummaryTab({
  accountSummary,
  reportsApi,
  journalId,
}: {
  accountSummary: AccountSummaryDto;
  reportsApi: ReportsApi;
  journalId: string;
}) {
  const { language } = useI18n();
  const labels = journalDetailsPageLabels[language];
  // const thisMonth = capitalize(getThisMonth(new Date(), language));
  const { isLoading, loadingStart, loadingEnd } = useLoader();
  const [month, setMonth] = useState(DateTime.utc().minus({ months: 1 }));
  const [monthlySummary, setMonthlySummary] = useState<JournalSummaryDto>();

  useEffect(() => {
    reportsApi
      .getJournalSummary({
        journalId,
        month: month.toFormat("yyyyMM"),
      })
      .then((summary) => setMonthlySummary(summary))
      .finally(() => loadingEnd());
  }, [month, reportsApi, journalId, loadingEnd]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Notebook className="w-5 h-5" /> {labels.paymentSummary}
        </h2>
      </div>
      <div className="overflow-scroll max-h-[calc(100vh-400px)] space-y-4">
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
                  <PaymentDueRow key={index} item={item} language={language} />
                )) ?? (
                  <Skeleton className="h-[4rem] w-full col-span-1 rounded-xl" />
                )}
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
            {monthlySummary && (
              <MonthlySummary
                monthlySummary={monthlySummary}
                isNavigatingMonth={isLoading}
                handleNextMonth={() => {
                  loadingStart();
                  setMonth((month) => month.plus({ months: 1 }));
                }}
                handlePrevMonth={() => {
                  loadingStart();
                  setMonth((month) => month.minus({ months: 1 }));
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
