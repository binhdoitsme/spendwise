"use client";

import {
  JournalAccountBasicDto,
  JournalUserBasicDto,
  TagDto,
  TransactionDetailedDto,
} from "@/modules/journals/application/dto/dtos.types";
import { CreditCard, Wallet } from "lucide-react";
import { Tags } from "../tag/tag-item";
import {
  TransactionCommand,
  TransactionCommands,
} from "./transaction-commands";

export interface TransactionItemProps {
  transaction: TransactionDetailedDto & {
    detailedTags: TagDto[];
    detailedPaidBy: JournalUserBasicDto;
    detailedAccount: JournalAccountBasicDto;
  };
  formatter: Intl.NumberFormat;
  commands?: TransactionCommand[];
  onClick?: () => void;
}

export function TransactionItem({
  transaction,
  formatter,
  onClick,
  commands = [],
}: TransactionItemProps) {
  const {
    detailedPaidBy: { firstName, lastName },
    detailedAccount,
    amount,
    type,
    detailedTags,
    title,
  } = transaction;
  const formattedAmount = formatter.format(
    type !== "INCOME" ? -amount : amount
  );

  return (
    <div className="grid grid-cols-9 items-start justify-between">
      <div className="col-span-3 flex flex-col gap-1">
        <h4
          className="text-md font-medium leading-none cursor-pointer"
          onClick={onClick}
        >
          {title}
        </h4>
        <p className="text-sm text-muted-foreground">
          {firstName} {lastName}
        </p>
      </div>
      <div className="col-span-2 flex items-center gap-2 text-sm">
        {detailedAccount.type.toLowerCase() === "cash" && <Wallet size="20" />}
        {["credit", "debit"].includes(detailedAccount.type.toLowerCase()) && (
          <CreditCard size="20" />
        )}
        {detailedAccount.displayName}
      </div>
      <div className="col-span-3 flex flex-col gap-1">
        <Tags tags={detailedTags} />
      </div>
      <div className="col-span-1 flex flex-row justify-end gap-2 text-sm font-semibold min-w-[100px]">
        <span
          className={
            formattedAmount.startsWith("-") ? "text-red-500" : "text-green-600"
          }
        >
          {formattedAmount}
        </span>
        {commands.length > 0 && (
          <TransactionCommands commands={commands} transaction={transaction} />
        )}
      </div>
    </div>
  );
}
