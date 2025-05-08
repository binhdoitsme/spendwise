import { Separator } from "@/components/ui/separator";
import { TransactionDetailedDto } from "@/modules/journals/application/dto/dtos.types";
import { TransactionItem } from "./transaction-item";
import { useMemo } from "react";

interface TransactionListProps {
  transactions: TransactionDetailedDto[];
  currency: string;
}

export function TransactionList({
  transactions,
  currency,
}: TransactionListProps) {
  const groupedByDate = transactions.reduce(
    (txsByDate, tx) => ({
      ...txsByDate,
      [tx.date]: [...(txsByDate[tx.date] ?? []), tx],
    }),
    {} as Record<string, TransactionDetailedDto[]>
  );

  const formatter = useMemo(
    () => new Intl.NumberFormat("de-DE", { style: "currency", currency }),
    []
  );

  return (
    <div className="space-y-4">
      {Object.entries(groupedByDate).map(([date, records]) => (
        <div key={date} className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">
            {new Date(date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h3>
          <div className="space-y-4 mt-2">
            {records.map((record) => (
              <TransactionItem
                key={record.id}
                transaction={record}
                formatter={formatter}
              />
            ))}
          </div>
          <Separator className="mt-4" />
        </div>
      ))}
    </div>
  );
}
