"use client";

import { Localizable } from "@/components/common/i18n";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { accountLabels } from "../labels";

export const accountFormSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("cash"),
    name: z.string().min(1),
  }),
  z.object({
    type: z.literal("debit"),
    name: z.string().min(1),
    bankName: z.string().min(1),
    last4: z.string().length(4),
  }),
  z.object({
    type: z.literal("credit"),
    name: z.string().min(1),
    bankName: z.string().min(1),
    last4: z.string().length(4),
    statementDay: z.number().min(1).max(28),
    gracePeriodInDays: z.number().min(1).max(60),
    limit: z.number().optional(),
  }),
  z.object({
    type: z.literal("loan"),
    name: z.string().min(1),
    bankName: z.string().min(1),
    loanStartDate: z.string(),
    loanEndDate: z.string(),
    originalAmount: z.number().min(0),
  }),
]);

export type AccountFormValues = z.infer<typeof accountFormSchema>;

interface AccountFormProps extends Localizable {
  onSubmit: (values: AccountFormValues) => void | Promise<void>;
  className?: string;
  initialValues?: AccountFormValues;
  disabled?: boolean;
}

export const AccountForm: React.FC<AccountFormProps> = ({
  onSubmit,
  className,
  initialValues,
  language = "en",
  disabled = false,
}) => {
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: initialValues ?? {
      type: "cash",
      name: "",
    },
    disabled,
  });

  const type = form.watch("type");
  const labels = accountLabels[language];

  return (
    <Form {...form}>
      <form className={cn(className)} onSubmit={form.handleSubmit(onSubmit)}>
        <div className="h-[calc(100%-3.25rem)] max-h-[50vh] space-y-6 mb-3 overflow-y-scroll">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{labels.accountType}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={labels.selectType} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">{labels.cash}</SelectItem>
                    <SelectItem value="debit">{labels.debit}</SelectItem>
                    <SelectItem value="credit">{labels.credit}</SelectItem>
                    <SelectItem value="loan">{labels.loan}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{labels.accountName}</FormLabel>
                <FormControl>
                  <Input placeholder={labels.myWalletPlaceholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {type === "debit" || type === "credit" || type === "loan" ? (
            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{labels.bankName}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={labels.bankNamePlaceholder}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}

          {(type === "debit" || type === "credit") && (
            <FormField
              control={form.control}
              name="last4"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{labels.last4}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={labels.last4Placeholder}
                      maxLength={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {type === "credit" && (
            <>
              <FormField
                control={form.control}
                name="statementDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{labels.statementDay}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={28}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value)
                          )
                        }
                        placeholder={labels.statementDayPlaceholder}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gracePeriodInDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{labels.gracePeriodInDays}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={60}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value)
                          )
                        }
                        placeholder={labels.gracePeriodPlaceholder}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{labels.limit}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={labels.limitPlaceholder}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {type === "loan" && (
            <>
              <FormField
                control={form.control}
                name="loanStartDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{labels.loanStartDate}</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        placeholder={labels.loanStartDatePlaceholder}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="loanEndDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{labels.loanEndDate}</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        placeholder={labels.loanEndDatePlaceholder}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="originalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{labels.originalAmount}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={labels.originalAmountPlaceholder}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>

        <Button type="submit" disabled={disabled}>
          {labels.saveAccount}
        </Button>
      </form>
    </Form>
  );
};
