import { Language } from "@/components/common/i18n";
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
import { LoadingSpinner } from "@/components/ui/spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  spendingCategoryFormSchema,
  SpendingCategoryFormSchema,
} from "./forms";
import { spendingCategoryLabels } from "./labels";

export function SpendingCategoryForm({
  initialValues,
  onSubmit,
  isLoading = false,
  language,
}: {
  initialValues?: SpendingCategoryFormSchema;
  onSubmit?: (data: SpendingCategoryFormSchema) => void | Promise<void>;
  isLoading?: boolean;
  language: Language;
}) {
  const form = useForm<SpendingCategoryFormSchema>({
    resolver: zodResolver(spendingCategoryFormSchema),
    defaultValues: initialValues || {},
  });

  const { handleSubmit, control } = form;
  const labels = spendingCategoryLabels[language];

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4 mt-2"
        onSubmit={handleSubmit(onSubmit ?? (() => {}))}
      >
        <FormField
          name="name"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{labels.formFieldName}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={labels.formFieldNamePlaceholder}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="limit"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{labels.formFieldAmount}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="1"
                  {...field}
                  placeholder={labels.formFieldAmountPlaceholder}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  value={
                    field.value !== undefined ? field.value.toString() : ""
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <LoadingSpinner />}
            {labels.formSubmit}
          </Button>
        </div>
      </form>
    </Form>
  );
}
