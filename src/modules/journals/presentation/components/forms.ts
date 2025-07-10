import { ISO_CURRENCIES } from "@/modules/shared/presentation/currencies";
import { z } from "zod";

export const journalFormSchema = z.object({
  title: z.string().max(128).nonempty("Title is required"),
  currency: z.enum(ISO_CURRENCIES),
});

export type JournalFormSchema = z.infer<typeof journalFormSchema>;

export const transactionFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().nonempty("Name is required"),
  amount: z.number(),
  date: z.date(),
  account: z.string().nonempty("Account is required"),
  tags: z.array(z.string()).nonempty(),
  type: z.enum(["INCOME", "EXPENSE"], { required_error: "Type is required" }),
  paidBy: z.string().nonempty("Paid by is required"),
  notes: z.string().optional(),
  categoryId: z.string().optional(),
});

export type TransactionFormSchema = z.infer<typeof transactionFormSchema>;
