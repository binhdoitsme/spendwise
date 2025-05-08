import { z } from "zod";

export type TransactionType = "expense" | "income" | "transfer";


export const transactionFormSchema = z.object({
  title: z.string().nonempty("Name is required"),
  amount: z.number().min(0, "Amount must be positive"),
  date: z.date(),
  account: z.string().nonempty("Account is required"),
  tags: z.array(z.string()).nonempty(),
  type: z.enum(["income", "expense"], { required_error: "Type is required" }),
  paidBy: z.string().nonempty("Paid by is required"),
  notes: z.string().optional(),
});

export type TransactionFormSchema = z.infer<typeof transactionFormSchema>;
