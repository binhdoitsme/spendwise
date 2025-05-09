import { Separator } from "@/components/ui/separator";
import {
  TagDto,
  TransactionDetailedDto,
} from "@/modules/journals/application/dto/dtos.types";
import { useMemo } from "react";
import { TransactionItem } from "./transaction-item";

interface TransactionListProps {
  tags: TagDto[];
  transactions: TransactionDetailedDto[];
  currency: string;
}

export function TransactionList({
  tags,
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
    [currency]
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
                transaction={{
                  ...record,
                  tags: record.tags.map(
                    (tag) => tags.find(({ id }) => id === tag)!
                  ),
                }}
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
