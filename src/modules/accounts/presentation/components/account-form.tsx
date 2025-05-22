"use client";

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

interface AccountFormProps {
  onSubmit: (values: AccountFormValues) => void | Promise<void>;
  className?: string;
  initialValues?: AccountFormValues;
}

export const AccountForm: React.FC<AccountFormProps> = ({
  onSubmit,
  className,
  initialValues,
}) => {
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: initialValues ?? {
      type: "cash",
      name: "",
    },
  });

  const type = form.watch("type");

  return (
    <Form {...form}>
      <form className={cn(className)} onSubmit={form.handleSubmit(onSubmit)}>
        <div className="h-[calc(100%-3.25rem)] max-h-[50vh] space-y-6 mb-3 overflow-y-scroll">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="debit">Debit</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                    <SelectItem value="loan">Loan</SelectItem>
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
                <FormLabel>Account Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="My Wallet / Visa Card / etc."
                    {...field}
                  />
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
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Vietcombank" {...field} />
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
                  <FormLabel>Last 4 digits</FormLabel>
                  <FormControl>
                    <Input placeholder="1234" maxLength={4} {...field} />
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
                    <FormLabel>Statement Day</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={28}
                        value={field.value ?? ''}
                        onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
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
                    <FormLabel>Grace Period (days)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={60}
                        value={field.value ?? ''}
                        onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
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
                    <FormLabel>Credit Limit</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Optional" {...field} />
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
                    <FormLabel>Loan Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <FormLabel>Loan End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <FormLabel>Original Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>

        <Button type="submit">Save Account</Button>
      </form>
    </Form>
  );
};
