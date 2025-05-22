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
import { ISO_CURRENCIES } from "@/modules/shared/presentation/currencies";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { journalFormSchema, JournalFormSchema } from "../forms";
import { journalLabels } from "./labels";

interface JournalFormProps extends Localizable {
  isLoading?: boolean;
  onSubmit: (data: JournalFormSchema) => void | Promise<void>;
}

export function JournalForm({
  onSubmit,
  isLoading,
  language,
}: JournalFormProps) {
  const labels = journalLabels[language];

  const form = useForm<JournalFormSchema>({
    resolver: zodResolver(journalFormSchema),
    defaultValues: {
      title: "",
      currency: undefined,
    },
  });

  const { handleSubmit, control } = form;

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4 mt-2"
        onSubmit={handleSubmit(onSubmit)}
      >
        <FormField
          name="title"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{labels.journalTitle}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={!!field.disabled || !!isLoading}
                  placeholder={labels.journalTitlePlaceholder}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="currency"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{labels.currency}</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                  disabled={!!field.disabled || !!isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={labels.currencyPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {ISO_CURRENCIES.map((code) => (
                      <SelectItem key={code} value={code}>
                        {code}
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
          <Button type="submit">{labels.submit}</Button>
        </div>
      </form>
    </Form>
  );
}
