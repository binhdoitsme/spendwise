import { z } from "zod";

/**
 * Zod schema for transaction filters, used in transaction-filters.tsx.
 */
export const filterSchema = z
  .object({
    showCredit: z.boolean(),
    filterByDate: z.boolean(),
    paidByCurrentUser: z.boolean().optional(),
    datePreset: z
      .enum(["current-month", "last-month", "recent-2-months", "custom"])
      .optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
  })
  .refine(
    (data) =>
      !data.filterByDate ||
      data.datePreset !== "custom" ||
      (data.startDate instanceof Date &&
        !isNaN(data.startDate.getTime()) &&
        data.endDate instanceof Date &&
        !isNaN(data.endDate.getTime())),
    {
      message: "Start and end date are required for custom range",
      path: ["startDate"],
    }
  );
