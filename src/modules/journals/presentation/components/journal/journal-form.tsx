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
import { ISO_CURRENCIES } from "@/modules/shared/presentation/currencies";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { journalFormSchema, JournalFormSchema } from "../forms";

interface JournalFormProps {
  isLoading?: boolean;
  onSubmit: (data: JournalFormSchema) => void | Promise<void>;
}

export function JournalForm({ onSubmit, isLoading }: JournalFormProps) {
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
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={!!field.disabled || !!isLoading}
                  placeholder="Give a memorable name for your finance journal"
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
              <FormLabel>Currency</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                  disabled={!!field.disabled || !!isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="e.g. VND, EUR, USD, etc." />
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
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
}
