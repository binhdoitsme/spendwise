import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { FilterIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const filterSchema = z
  .object({
    showCredit: z.boolean(),
    filterByDate: z.boolean(),
    paidByCurrentUser: z.boolean().optional(),
    datePreset: z
      .enum(["current-month", "last-month", "recent-2-months", "custom"])
      .optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
  })
  .refine(
    (data) =>
      data.datePreset !== "custom" ||
      (data.startDate instanceof Date &&
        !isNaN(data.startDate.getTime()) &&
        data.endDate instanceof Date &&
        !isNaN(data.endDate.getTime())),
    {
      message: "Start and end date are required for custom range",
      path: ["startDate"],
    }
  );
export type FilterSchema = z.infer<typeof filterSchema>;

export function TransactionQuickFilters({
  handleFilter,
}: {
  handleFilter: (data: FilterSchema) => Promise<void>;
}) {
  const form = useForm<FilterSchema>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      showCredit: false,
      filterByDate: false,
    },
  });
  const filterByDate = form.watch("filterByDate");
  const quickFilterCount =
    Number(form.watch("showCredit")) + Number(form.watch("filterByDate"));

  const onSubmit = form.handleSubmit(async (data) => {
    await handleFilter(data);
  });

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            Quick Filters <FilterIcon />{" "}
            {quickFilterCount > 0 && (
              <Badge className="rounded-full text-xs">{quickFilterCount}</Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="end">
          <Form {...form}>
            <form onSubmit={onSubmit}>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Quick Filters</h3>
                <FormField
                  name="showCredit"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="credit-accounts"
                        />
                      </FormControl>
                      <FormLabel
                        htmlFor="credit-accounts"
                        className="font-normal"
                      >
                        Show only credit transactions
                      </FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="filterByDate"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="filter-by-date"
                        />
                      </FormControl>
                      <FormLabel
                        htmlFor="filter-by-date"
                        className="font-normal"
                      >
                        Filter by Date
                      </FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="datePreset"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="px-4">
                      <FormControl>
                        <RadioGroup
                          disabled={!filterByDate}
                          value={field.value}
                          onValueChange={field.onChange}
                          className="flex flex-col gap-3"
                        >
                          <FormItem className="flex flex-row items-center gap-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem
                                value="current-month"
                                id="current-month"
                                className="w-4 h-4"
                              />
                            </FormControl>
                            <FormLabel
                              htmlFor="current-month"
                              className="font-normal"
                            >
                              Current month
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex flex-row items-center gap-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem
                                value="last-month"
                                id="last-month"
                                className="w-4 h-4"
                              />
                            </FormControl>
                            <FormLabel
                              htmlFor="last-month"
                              className="font-normal"
                            >
                              Last month
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex flex-row items-center gap-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem
                                value="recent-2-months"
                                id="recent-2-months"
                                className="w-4 h-4"
                              />
                            </FormControl>
                            <FormLabel
                              htmlFor="recent-2-months"
                              className="font-normal"
                            >
                              Most recent 2 months
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex flex-row items-center gap-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem
                                value="custom"
                                id="custom"
                                className="w-4 h-4"
                              />
                            </FormControl>
                            <FormLabel htmlFor="custom" className="font-normal">
                              Custom range
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {form.watch("datePreset") === "custom" && (
                  <div className="grid grid-cols-2 gap-4 px-4">
                    <FormField
                      name="startDate"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <input
                              type="date"
                              value={
                                field.value?.toISOString().split("T")[0] ?? ""
                              }
                              onChange={(e) =>
                                field.onChange(new Date(e.target.value))
                              }
                              className="border rounded-md px-2 py-1"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="endDate"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <input
                              type="date"
                              value={
                                field.value?.toISOString().split("T")[0] ?? ""
                              }
                              onChange={(e) =>
                                field.onChange(new Date(e.target.value))
                              }
                              className="border rounded-md px-2 py-1"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
              <Button variant="outline" className="w-full mt-4" type="submit">
                Apply Filters
              </Button>
            </form>
          </Form>
        </PopoverContent>
      </Popover>
    </div>
  );
}
