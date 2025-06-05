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
import { CalendarClock, Notebook } from "lucide-react";
import { journalDetailsPageLabels } from "./labels";

export function SummaryTab({
  accountSummary,
  monthlySummary,
  handleNextMonth,
  handlePrevMonth,
}: {
  accountSummary: AccountSummaryDto;
  monthlySummary: JournalSummaryDto;
  handleNextMonth: () => void;
  handlePrevMonth: () => void;
}) {
  const { language } = useI18n();
  const labels = journalDetailsPageLabels[language];
  // const thisMonth = capitalize(getThisMonth(new Date(), language));
  const { isLoading } = useLoader();

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
          </>
        )}
      </div>
    </div>
  );
}
