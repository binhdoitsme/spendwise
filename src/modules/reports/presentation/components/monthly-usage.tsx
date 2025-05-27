import { Progress } from "@/components/ui/progress";
import { useMemo } from "react";
import { MonthlySpend } from "../../application/dto/dtos.types";
import { Calendar, CreditCard, Wallet } from "lucide-react";
import { Localizable } from "@/components/common/i18n";
import { reportingLabels } from "./labels";

export interface MonthlyUsageProps extends Localizable {
  item: MonthlySpend;
  orientation?: "title" | "month";
}

export function MonthlyUsage({
  item,
  language,
  orientation = "title",
}: MonthlyUsageProps) {
  const labels = reportingLabels[language];
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: item.spentAmount.currency,
      }),
    [item.spentAmount.currency]
  );

  const formatMonth = (date: Date) => {
    switch (language) {
      case "vi": {
        const value = date.toLocaleDateString("vi-VN", {
          month: "short",
          year: "numeric",
        });
        return value[0].toUpperCase() + value.slice(1);
      }
      default: {
        const value = date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
        return value[0].toUpperCase() + value.slice(1);
      }
    }
  };

  const utilization = !item.creditLimit
    ? undefined
    : Math.round((item.spentAmount.amount / item.creditLimit.amount) * 10000) /
      100;
  const barColor = !utilization
    ? undefined
    : utilization < 50
    ? "bg-green-500"
    : utilization < 80
    ? "bg-yellow-400"
    : "bg-red-500";

  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <div className="font-medium flex items-center gap-2">
          {orientation === "title" && (
            <>
              {["credit", "debit"].includes(item.account.type) && (
                <CreditCard className="w-4 h-4" />
              )}
              {["cash"].includes(item.account.type) && (
                <Wallet className="w-4 h-4" />
              )}{" "}
              {item.account.displayName}
            </>
          )}
          {orientation === "month" && (
            <>
              <Calendar className="w-4 h-4" />{" "}
              {formatMonth(new Date(item.month))}
            </>
          )}
        </div>
        {utilization !== undefined && (
          <div className="text-sm text-muted-foreground">
            {labels.percentUsed(utilization)}
          </div>
        )}
      </div>
      <div className="text-sm text-muted-foreground">
        {labels.spent} {currencyFormatter.format(item.spentAmount.amount)}
        {item.creditLimit && (
          <>
            {" "}
            / {labels.limit} {currencyFormatter.format(item.creditLimit.amount)}
          </>
        )}
      </div>
      <Progress
        value={utilization}
        className={barColor + " h-2 rounded-full"}
      />
    </div>
  );
}
