import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  TagDto,
  UserBasicDto,
} from "@/modules/journals/application/dto/dtos.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { transactionFormSchema, TransactionFormSchema } from "../forms";

export interface AccountSelectProps {
  accountId: string;
  name: string;
}

export interface TransactionFormProps {
  accounts: Record<string, AccountSelectProps[]>;
  collaborators: UserBasicDto[];
  tags: TagDto[];
  onSubmit: (data: TransactionFormSchema) => void | Promise<void>;
}

export function TransactionForm({
  accounts,
  collaborators,
  tags,
  onSubmit,
}: TransactionFormProps) {
  const isDevMode = true;
  const form = useForm<TransactionFormSchema>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      title: undefined,
      amount: undefined,
      date: undefined,
      account: undefined,
      tags: [],
      type: "EXPENSE",
      paidBy: undefined,
    },
  });
  const paidByUser = form.watch("paidBy");

  useEffect(() => {
    form.resetField("account", { defaultValue: "" });
  }, [form, paidByUser]);

  const tagOptions = tags.map(({ id, name }) => ({ label: name, value: id }));

  const doAutofill = useCallback(() => {
    form.setValue("title", "Sample Transaction");
    form.setValue("amount", 100000);
    form.setValue("date", new Date());
    form.setValue("paidBy", collaborators[0].email);
    form.setValue("account", accounts[collaborators[0].email][0].accountId);
    form.setValue("tags", ["food", "transport"]);
    form.setValue("notes", "This is a sample note for testing.");
  }, [form, collaborators, accounts]);

  return (
    <Form {...form}>
      {isDevMode && (
        <div>
          <Button variant="outline" size="sm" onClick={() => doAutofill()}>
            Auto-fill
          </Button>
        </div>
      )}
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="max-h-[calc(100vh-300px)] overflow-y-scroll flex flex-col gap-2 p-1">
          <FormField
            name="type"
            control={form.control}
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Type</FormLabel>
                <FormControl className="mb-2">
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-row items-center"
                    orientation="horizontal"
                  >
                    {[
                      { label: "Expense", value: "EXPENSE" },
                      { label: "Income", value: "INCOME" },
                    ].map(({ label, value }) => (
                      <FormItem
                        key={value}
                        className="flex flex-row items-center space-x-1 space-y-0"
                      >
                        <FormControl>
                          <RadioGroupItem value={value} />
                        </FormControl>
                        <FormLabel className="font-normal">{label}</FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="title"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Pho lunch, Invoice #42" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="amount"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    disabled={field.disabled}
                    placeholder="e.g. 120000"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="date"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <DateInput {...field} placeholder="Date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="paidBy"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paid by</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {collaborators.map((user) => (
                        <SelectItem key={user.email} value={user.email}>
                          {user.firstName} {user.lastName} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="account"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="e.g. Cash, Bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(accounts).length === 0 && (
                        <SelectItem value="_" disabled>
                          Add an account to continue
                        </SelectItem>
                      )}
                      {paidByUser &&
                        accounts[paidByUser]?.map(({ accountId, name }) => (
                          <SelectItem key={accountId} value={accountId}>
                            {name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="tags"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <MultiSelect
                    {...field}
                    placeholder="e.g. Food, Transport"
                    onValueChange={field.onChange}
                    options={tagOptions}
                    error={!!form.formState.errors.tags}
                    errorMessage={form.formState.errors.tags?.message?.toString()}
                    maxCount={3}
                    onAddOption={(option) => alert(JSON.stringify(option))}
                  />
                </FormControl>
                {/* <FormMessage /> */}
              </FormItem>
            )}
          />
          <FormField
            name="notes"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Optional note or description..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit">Save Record</Button>
        </div>
      </form>
    </Form>
  );
}
