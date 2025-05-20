"use client";

import {
  JournalAccountBasicDto,
  JournalUserBasicDto,
  TagDto,
  TransactionDetailedDto,
} from "@/modules/journals/application/dto/dtos.types";
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
    detailedAccount: { displayName },
    amount,
    type,
    detailedTags,
    title,
  } = transaction;
  const formattedAmount = formatter.format(
    type !== "INCOME" ? -amount : amount
  );

  return (
    <div className="flex items-start justify-between">
      <div className="flex flex-col gap-1">
        <h4
          className="text-md font-medium leading-none cursor-pointer"
          onClick={onClick}
        >
          {title}
        </h4>
        <p className="text-sm text-muted-foreground">
          {firstName} {lastName} • {displayName}
        </p>
        <Tags tags={detailedTags} />
      </div>
      <div className="flex flex-row justify-end gap-2 text-sm font-semibold min-w-[100px]">
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
