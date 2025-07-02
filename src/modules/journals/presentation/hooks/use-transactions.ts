"use client";

import {
  SpendwiseDexie,
  spendwiseIDb,
} from "@/modules/shared/presentation/components/indexed-db";
import { Interval } from "luxon";

export function useTransactions(db: SpendwiseDexie = spendwiseIDb) {
  return {
    async hasData(): Promise<boolean> {
      return (await db.transactions.count()) > 0;
    },
    async list(timeRange: Interval) {
      return await db.transactions
        .where("date")
        .between(
          timeRange.start!.toISODate(),
          timeRange.end!.toISODate(),
          true,
          false
        )
        .toArray();
    },
  };
}
