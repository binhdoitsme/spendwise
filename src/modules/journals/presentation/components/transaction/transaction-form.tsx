import { Localizable } from "@/components/common/i18n";
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
  JournalUserBasicDto,
  TagDto,
  TransactionDetailedDto,
} from "@/modules/journals/application/dto/dtos.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { transactionFormSchema, TransactionFormSchema } from "../forms";
import { Colorized } from "../tag/tag-colors";
import { Tags } from "../tag/tag-item";
import { transactionLabels } from "./labels";

export interface AccountSelectProps {
  accountId: string;
  name: string;
}

export interface TransactionFormProps extends Localizable {
  transaction?: Omit<TransactionDetailedDto, "id"> &
    Partial<Pick<TransactionDetailedDto, "id">>;
  isReadonly?: boolean;
  accounts: Record<string, AccountSelectProps[]>;
  collaborators: JournalUserBasicDto[];
  tags: (TagDto & Colorized)[];
  onSubmit: (data: TransactionFormSchema) => void | Promise<void>;
  onUnknownTag?: (tag: string) => Promise<void>;
  onNoAccount?: () => void | Promise<void>;
}

export function TransactionForm({
  transaction,
  accounts,
  collaborators,
  tags,
  language,
  isReadonly = false,
  onSubmit,
  onNoAccount,
  onUnknownTag,
}: TransactionFormProps) {
  const isDevMode = true;
  const labels = transactionLabels[language];
  const form = useForm<TransactionFormSchema>({
    resolver: zodResolver(transactionFormSchema),
    disabled: isReadonly,
    defaultValues: transaction
      ? {
          id: transaction.id,
          title: transaction.title,
          amount: transaction.amount,
          date: new Date(transaction.date),
          paidBy: transaction.paidBy,
          account: transaction.accountId,
          tags: transaction.tags,
          type: transaction.type as "INCOME" | "EXPENSE",
        }
      : {
          title: "",
          amount: undefined,
          date: undefined,
          account: "",
          tags: [],
          type: "EXPENSE",
          paidBy: "",
        },
  });
  const paidByUser = form.watch("paidBy");
  const account = form.watch("account");

  useEffect(() => {
    if (
      !(accounts[paidByUser] ?? [])
        .map(({ accountId }) => accountId)
        .includes(account)
    ) {
      form.resetField("account", { defaultValue: "" });
    }
  }, [form, paidByUser, accounts, account]);

  const tagOptions = tags.map(({ id, name }) => ({ label: name, value: id }));

  const doAutofill = useCallback(() => {
    form.setValue("title", "Sample Transaction");
    form.setValue("amount", 100000);
    form.setValue("date", new Date());
    form.setValue("paidBy", collaborators[0].id);
    form.setValue("account", accounts[collaborators[0].id][0].accountId);
    form.setValue("tags", ["food", "transport"]);
    form.setValue("notes", "This is a sample note for testing.");
  }, [form, collaborators, accounts]);

  return (
    <Form {...form}>
      {isDevMode && !isReadonly && (
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
                <FormLabel>{labels.type}</FormLabel>
                <FormControl className="mb-2">
                  <RadioGroup
                    {...field}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-row items-center"
                    orientation="horizontal"
                  >
                    {[
                      { label: labels.expense, value: "EXPENSE" },
                      { label: labels.income, value: "INCOME" },
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
                <FormLabel>{labels.title}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={labels.titlePlaceholder} />
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
                <FormLabel>{labels.amount}</FormLabel>
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
                <FormLabel>{labels.date}</FormLabel>
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
                <FormLabel>{labels.paidBy}</FormLabel>
                <FormControl>
                  <Select
                    {...field}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={labels.paidByPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {collaborators.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
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
                <FormLabel>{labels.account}</FormLabel>
                <FormControl>
                  <Select
                    disabled={field.disabled || !paidByUser}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={labels.accountPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(accounts).length === 0 && (
                        <Button
                          className="w-full flex justify-start"
                          variant="ghost"
                          onClick={onNoAccount}
                        >
                          <Plus />
                          {labels.linkAccountOnNoAccount}
                        </Button>
                      )}
                      {paidByUser &&
                        accounts[transaction?.paidBy ?? paidByUser]?.map(
                          ({ accountId, name }) => (
                            <SelectItem key={accountId} value={accountId}>
                              {name}
                            </SelectItem>
                          )
                        )}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {isReadonly ? (
            <FormItem>
              <FormLabel>{labels.tags}</FormLabel>
              <div className="pt-1 pb-4">
                <Tags
                  tags={transaction!.tags.map(
                    (tagId) => tags.find(({ id }) => id === tagId)!
                  )}
                />
              </div>
            </FormItem>
          ) : (
            <FormField
              name="tags"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{labels.tags}</FormLabel>
                  <FormControl>
                    <MultiSelect
                      {...field}
                      defaultValue={field.value}
                      placeholder={labels.tagsPlaceholder}
                      onValueChange={field.onChange}
                      options={tagOptions}
                      error={!!form.formState.errors.tags}
                      errorMessage={form.formState.errors.tags?.message?.toString()}
                      maxCount={3}
                      onAddOption={(option) => onUnknownTag?.(option.label)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}
          <FormField
            name="notes"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{labels.notes}</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder={labels.notesPlaceholder} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {!isReadonly && (
          <div className="flex justify-end">
            <Button type="submit">{labels.saveTransaction}</Button>
          </div>
        )}
      </form>
    </Form>
  );
}
