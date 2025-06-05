import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/spinner";
import {
  ArrowBigUp,
  ChartColumnBig,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { DateTime } from "luxon";
import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { JournalSummaryDto } from "../../application/dto/dtos.types";
import { reportingLabels } from "./labels";
import { Skeleton } from "@/components/ui/skeleton";

export type MonthlySummaryProps = {
  monthlySummary: JournalSummaryDto;
  isNavigatingMonth: boolean;
  handleNextMonth: () => void;
  handlePrevMonth: () => void;
};

export function MonthlySummary(props: MonthlySummaryProps) {
  const labels = reportingLabels["vi"];

  const {
    monthlySummary: {
      month,
      totalSpent,
      spentChange,
      spendingTags,
      accounts,
      currency,
    },
    isNavigatingMonth: isDisableMonthNavigation,
    handlePrevMonth,
    handleNextMonth,
  } = props;

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: currency,
      }),
    [currency]
  );

  return (
    <Card className="gap-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ChartColumnBig />
            {labels.monthlySummary}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevMonth}
              disabled={isDisableMonthNavigation}
            >
              <ChevronLeft />
            </Button>
            <span className="text-base font-medium">
              {capitalize(
                DateTime.fromFormat(month, "yyyyMM")
                  .toJSDate()
                  .toLocaleDateString("vi-VN", {
                    month: "long",
                    year: "numeric",
                  })
              )}
            </span>
            {isDisableMonthNavigation && <LoadingSpinner />}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              disabled={isDisableMonthNavigation}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="grid grid-cols-2 gap-4 justify-between">
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="font-semibold">{labels.totalSpent}</h3>
            {props.isNavigatingMonth && (
              <div>
                <Skeleton className="h-[4rem] w-full col-span-1 rounded-xl" />
              </div>
            )}
            {!props.isNavigatingMonth && (
              <div className="flex flex-col items-baseline gap-0">
                <div className="text-2xl font-bold">
                  {currencyFormatter.format(totalSpent)}
                </div>
                <div
                  className={`flex items-center gap-1 mt-1 ${
                    spentChange > 0 ? "text-red-500" : "text-green-600"
                  }`}
                >
                  <ArrowBigUp
                    className="w-4 h-4"
                    fill={spentChange > 0 ? "red" : "green"}
                  />
                  <span className="text-sm font-semibold">
                    {spentChange > 0 ? "+" : ""}
                    {currencyFormatter.format(spentChange)}
                  </span>
                </div>
              </div>
            )}
            <div className="w-full h-[6.5rem]"></div>
          </div>
          <Separator />
          {props.isNavigatingMonth && (
            <div>
              <Skeleton className="h-[4rem] w-full col-span-1 rounded-xl" />
            </div>
          )}
          {!props.isNavigatingMonth && spendingTags.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                {labels.topSpendingTags}
              </h3>
              <div className="space-y-1">
                {spendingTags.map((tag) => (
                  <div key={tag.name} className="flex gap-2 justify-between">
                    <Badge variant="secondary">{tag.name}</Badge>
                    <span className="font-semibold">
                      {currencyFormatter.format(tag.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {accounts.some(({ value }) => value > 0) && (
          <div>
            <h3 className="font-semibold">{labels.spendingByAccount}</h3>
            <div className="flex flex-col items-center gap-4">
              <ResponsiveContainer width={240} height={240}>
                <PieChart>
                  <Pie data={accounts} dataKey="value" outerRadius={100}>
                    {accounts.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={pieColors[index % pieColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div
                            className="recharts-default-tooltip"
                            style={{
                              backgroundColor: "white",
                              border: "1px solid #ccc",
                              padding: "10px",
                            }}
                          >
                            {payload.map((entry, index) => {
                              return (
                                <p
                                  key={`item-${index}`}
                                  style={{ color: entry.color }}
                                >
                                  {entry.name}:{" "}
                                  <strong>
                                    {currencyFormatter.format(
                                      entry.value as number
                                    )}
                                  </strong>
                                </p>
                              );
                            })}
                          </div>
                        );
                      }

                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1 text-sm">
                {accounts.map((entry, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: pieColors[i % pieColors.length],
                      }}
                    />
                    <span>{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const capitalize = (value: string) =>
  value.slice(0, 1).toUpperCase() + value.slice(1);

// Fixed list of 20 tailwind-compatible colors (contrast colors next to each other)
const pieColors = [
  "#f87171", // red-400
  "#60a5fa", // blue-400
  "#fbbf24", // yellow-400
  "#34d399", // green-400
  "#a78bfa", // purple-400
  "#f472b6", // pink-400
  "#38bdf8", // sky-400
  "#fb7185", // rose-400
  "#facc15", // yellow-300
  "#4ade80", // green-300
  "#818cf8", // indigo-400
  "#f9a8d4", // pink-300
  "#22d3ee", // cyan-400
  "#fcd34d", // yellow-200
  "#6ee7b7", // emerald-300
  "#c4b5fd", // purple-300
  "#fca5a5", // red-300
  "#7dd3fc", // sky-300
  "#fde68a", // yellow-100
  "#bbf7d0", // green-100
];
