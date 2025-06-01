import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowBigUp,
  ChartColumnBig,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { reportingLabels } from "./labels";

const data = [
  { name: "Acc 1", value: 400000, color: "#ef4444" }, // red
  { name: "Super long account 2", value: 300000, color: "#3b82f6" }, // blue
  { name: "Acc 3", value: 300000, color: "#10b981" }, // green
  { name: "Acc 4", value: 200000, color: "#facc15" }, // yellow
  { name: "Acc 5", value: 180000, color: "#9ca3af" }, // gray
];

export default function MonthlySummary() {
  const labels = reportingLabels["vi"];
  return (
    <Card className="gap-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ChartColumnBig />
            {labels.monthlySummary}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <ChevronLeft />
            </Button>
            <span className="text-base font-medium">Tháng 5 năm 2025</span>
            <Button variant="ghost" size="icon">
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
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold">11.111.111 đ</div>
              <div className="text-red-500 flex items-center gap-1 mt-1">
                <ArrowBigUp className="w-4 h-4" fill="red" />
                <span className="text-sm font-semibold">+111.111 đ</span>
              </div>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{labels.topSpendingTags}</h3>
            <div className="space-y-1">
              <div className="flex gap-2 justify-between">
                <Badge variant="secondary">Ăn uống</Badge>
                <span className="font-semibold">1.200.000 đ</span>
              </div>
              <div className="flex gap-2 justify-between">
                <Badge variant="secondary">Chợ</Badge>
                <span className="font-semibold">1.000.000 đ</span>
              </div>
              <div className="flex gap-2 justify-between">
                <Badge variant="secondary">Di chuyển</Badge>
                <span className="font-semibold">800.000 đ</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-semibold">{labels.spendingByAccount}</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={240} height={240}>
              <PieChart>
                <Pie data={data} dataKey="value" outerRadius={100}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1 text-sm">
              {data.map((entry, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
