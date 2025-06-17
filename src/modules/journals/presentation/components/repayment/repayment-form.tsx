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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JournalUserBasicDto } from "@/modules/journals/application/dto/dtos.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AccountSelectProps } from "../transaction/transaction-form";

export interface RepaymentFormProps extends Localizable {
  accountId: string;
  statementMonth: string;
  handleCreateRepayment: ({
    accountId,
    paymentAccountId,
    paymentPaidBy,
    statementMonth,
    date,
  }: {
    accountId: string;
    paymentAccountId: string;
    paymentPaidBy: string;
    statementMonth: string;
    date: Date;
  }) => Promise<void>;
  accounts: Record<string, AccountSelectProps[]>;
  collaborators: JournalUserBasicDto[];
}

export function RepaymentForm({
  accounts,
  collaborators,
  ...props
}: RepaymentFormProps) {
  const payoffFormSchema = z.object({
    title: z.string().optional(),
    date: z.date(),
    account: z.string().nonempty("Account is required"),
    paidBy: z.string().nonempty("Paid by is required"),
  });
  const form = useForm<z.infer<typeof payoffFormSchema>>({
    resolver: zodResolver(payoffFormSchema),
    defaultValues: {},
  });
  const paidByUser = form.watch("paidBy");

  const handleSubmitPayoffForm = async (
    data: z.infer<typeof payoffFormSchema>
  ) => {
    await props.handleCreateRepayment({
      accountId: props.accountId,
      paymentAccountId: data.account!,
      paymentPaidBy: data.paidBy,
      statementMonth: props.statementMonth,
      date: data.date,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">Payment info</h3>
      <Form {...form}>
        <form
          className="flex flex-col gap-3"
          onSubmit={async (e) => {
            console.log({ e });
            console.log(handleSubmitPayoffForm);
            await form.handleSubmit(handleSubmitPayoffForm)(e);
          }}
        >
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
                  <Select
                    {...field}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select ..." />
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
                <FormLabel>Account</FormLabel>
                <FormControl>
                  <Select
                    disabled={field.disabled}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(accounts).length === 0 && (
                        <Button
                          className="w-full flex justify-start"
                          variant="ghost"
                          onClick={() => alert("Add an account")}
                        >
                          <Plus />
                          Add an account to continue
                        </Button>
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
          <div>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
