import { Progress } from "@/components/ui/progress";
import { useMemo } from "react";
import { MonthlyCreditSpend } from "../../application/dto/dtos.types";
import { CreditCard } from "lucide-react";
import { Localizable } from "@/components/common/i18n";
import { reportingLabels } from "./labels";

export interface MonthlyUsageProps extends Localizable {
  item: MonthlyCreditSpend;
}

export function MonthlyUsage({ item, language }: MonthlyUsageProps) {
  const labels = reportingLabels[language];
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: item.spentAmount.currency,
      }),
    [item.spentAmount.currency]
  );
  const utilization = Math.round(
    (item.spentAmount.amount / item.creditLimit.amount) * 100
  );
  const barColor =
    utilization < 50
      ? "bg-green-500"
      : utilization < 80
      ? "bg-yellow-400"
      : "bg-red-500";

  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <div className="font-medium flex items-center gap-2">
          <CreditCard className="w-4 h-4" /> {item.account.displayName}
        </div>
        <div className="text-sm text-muted-foreground">
          {labels.percentUsed(utilization)}
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        {labels.spent} {currencyFormatter.format(item.spentAmount.amount)} /{" "}
        {labels.limit} {currencyFormatter.format(item.creditLimit.amount)}
      </div>
      <Progress
        value={utilization}
        className={barColor + " h-2 rounded-full"}
      />
    </div>
  );
}
