import { z } from "zod";

export const spendingCategoryFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  limit: z.number().min(0, "Limit must be greater than 0"),
});

export type SpendingCategoryFormSchema = z.infer<
  typeof spendingCategoryFormSchema
>;
