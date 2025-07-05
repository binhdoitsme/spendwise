import { Language, Localizable } from "@/components/common/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, CreditCard } from "lucide-react";
import { useMemo } from "react";
import { PaymentDue } from "../../application/dto/dtos.types";
import { reportingLabels } from "./labels";
import { DateTime, Interval } from "luxon";

function formatDueDate(isoDate: string, language: Language): string {
  const labels = reportingLabels[language];
  const today = new Date();
  const date = new Date(isoDate);
  const diffDays = Math.floor(
    (date.getTime() - today.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return labels.today;
  if (diffDays === 1) return labels.tomorrow;
  if (diffDays === -1) return labels.yesterday;
  switch (language) {
    case "vi":
      return date.toLocaleDateString("vi-VN", {
        month: "long",
        day: "numeric",
      });
    default:
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      });
  }
}

function StatusBadge({
  dueDate,
  isCurrentPeriod,
  language,
}: {
  dueDate: string;
  isCurrentPeriod: boolean;
  language: Language;
}) {
  const labels = reportingLabels[language];
  if (isCurrentPeriod) {
    return <Badge variant="secondary">{labels.currentPeriod}</Badge>;
  }
  const today = new Date();
  const date = new Date(dueDate);
  const diffDays = Math.floor(
    (date.getTime() - today.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0)
    return (
      <Badge className="bg-yellow-400 text-white">{labels.dueToday}</Badge>
    );
  if (diffDays === 1)
    return (
      <Badge className="bg-yellow-400 text-white">{labels.dueTomorrow}</Badge>
    );
  if (diffDays === -1)
    return (
      <Badge className="bg-red-500 text-white">{labels.overdueYesterday}</Badge>
    );
  if (diffDays < -1)
    return <Badge className="bg-red-500 text-white">{labels.overdue}</Badge>;
  if (diffDays > 0 && diffDays <= 7)
    return (
      <Badge className="bg-yellow-200 text-yellow-900">
        {labels.dueInDays(diffDays)}
      </Badge>
    );
  if (diffDays > 7)
    return (
      <Badge className="bg-green-200 text-green-800">{labels.notYetDue}</Badge>
    );
  return null;
}

export interface PaymentDueProps extends Localizable {
  item: PaymentDue;
  format?: "compact" | "full";
  handlePayoffButton?: () => void | Promise<void>;
}

export function PaymentDueRow({
  item,
  format = "full",
  language,
  handlePayoffButton,
}: PaymentDueProps) {
  const labels = reportingLabels[language];
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: item.dueAmount.currency,
      }),
    [item.dueAmount.currency]
  );
  const statementPeriodStart = DateTime.fromISO(item.statementPeriod.start);
  const statementPeriodEnd = DateTime.fromISO(item.statementPeriod.end);
  const statementPeriod = Interval.fromDateTimes(
    statementPeriodStart,
    statementPeriodEnd
  );
  const now = DateTime.now();
  const isCurrentPeriod = statementPeriod.contains(now);

  return (
    <div className="flex justify-between items-start border-b pb-3 last:border-b-0 last:pb-0 mt-3">
      <div>
        <div className="font-medium flex items-center gap-2">
          <CreditCard className="w-4 h-4" /> {item.account.displayName}
        </div>
        <div className="text-sm font-semibold text-muted-foreground">
          {labels.statementPeriod}{" "}
          {formatDueDate(item.statementPeriod.start, language)} -{" "}
          {formatDueDate(item.statementPeriod.end, language)}
        </div>
        <div className="text-sm text-muted-foreground">
          {labels.due} {formatDueDate(item.dueDate, language)}
        </div>
        {format === "full" && !item.isPaidOff && (
          <div className="mt-1">
            <StatusBadge
              dueDate={item.dueDate}
              language={language}
              isCurrentPeriod={isCurrentPeriod}
            />
          </div>
        )}
      </div>
      <div className="flex flex-col items-end justify-between gap-2 h-full">
        <div className="font-semibold flex justify-end gap-2">
          <span>{currencyFormatter.format(item.dueAmount.amount)}</span>
          {/* <Button className="w-auto h-auto p-0" size="icon" variant="ghost">
            <MoreHorizontal />
          </Button> */}
        </div>
        {format === "full" && !item.isPaidOff && !isCurrentPeriod && (
          <Button variant="outline" onClick={handlePayoffButton}>
            {labels.markAsPaid}
          </Button>
        )}
        {format === "full" && item.isPaidOff && (
          <Button
            className="disabled:border-green-600 disabled:text-green-600"
            variant="outline"
            disabled
            onClick={handlePayoffButton}
          >
            <CheckCircle /> {labels.successfullyPaid}
          </Button>
        )}
      </div>
    </div>
  );
}
