import { Localizable } from "@/components/common/i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { SpendingCategoryDto } from "@/modules/shared/application/dto/dtos.types";
import { MoneyAmount } from "@/modules/shared/presentation/currencies";
import { MoreHorizontal, Trash } from "lucide-react";
import { useMemo } from "react";
import { spendingCategoryLabels } from "./labels";

export interface SpendingCategoryProps extends Localizable {
  category: SpendingCategoryDto;
  spent?: MoneyAmount;
  handleDelete?: (categoryId: string) => void | Promise<void>;
}

export function SpendingCategory({
  category,
  spent,
  language,
  handleDelete,
}: SpendingCategoryProps) {
  const labels = spendingCategoryLabels[language];
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(language === "vi" ? "vi-VN" : "en-US", {
        style: "currency",
        currency: category.limit.currency,
      }),
    [category, language]
  );

  const utilization =
    spent && category.limit.amount > 0
      ? Math.round((spent.amount / category.limit.amount) * 10000) / 100
      : undefined;

  const barColor =
    utilization === undefined
      ? undefined
      : utilization < 60
      ? "bg-green-500"
      : utilization < 80
      ? "bg-yellow-400"
      : "bg-red-500";

  return (
    <div className="space-y-1 rounded-lg">
      <div className="flex justify-between">
        <div className="font-medium flex items-center gap-2">
          {category.name}
        </div>
        <div className="text-sm text-gray-500 flex items-center gap-2">
          {!!spent && utilization !== undefined && (
            <span>
              {labels.remaining}:{" "}
              <span className="font-bold">
                {currencyFormatter.format(
                  category.limit.amount - spent.amount > 0
                    ? category.limit.amount - spent.amount
                    : 0
                )}
              </span>
            </span>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-auto w-auto p-0">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* <DropdownMenuItem className="gap-3">
                <Edit />
                {labels.actionEdit}
              </DropdownMenuItem> */}
              <DropdownMenuItem
                className="text-destructive gap-3"
                onClick={async () => await handleDelete?.(category.id)}
              >
                <Trash className="text-destructive" />
                {labels.actionDelete}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="relative">
        <Progress
          value={(utilization ?? 0) >= 100 ? 100 : utilization}
          className={cn(
            barColor,
            "h-4 rounded-sm",
            (utilization ?? 0) >= 100
              ? "[&_.progress-indicator]:bg-red-500"
              : ""
          )}
        />
        <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-semibold">
          {/* Your text here, e.g. {utilization}% */}
          {!!spent && currencyFormatter.format(spent.amount)} /{" "}
          {currencyFormatter.format(category.limit.amount)}
        </span>
      </div>
    </div>
  );
}
