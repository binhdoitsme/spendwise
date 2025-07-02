"use client";

import {
  JournalAccountBasicDto,
  JournalUserBasicDto,
  TagDto,
  TransactionDetailedDto,
} from "@/modules/journals/application/dto/dtos.types";
import { CreditCard, Wallet } from "lucide-react";
import { Colorized } from "../tag/tag-colors";
import { Tags } from "../tag/tag-item";
import {
  TransactionCommand,
  TransactionCommands,
} from "./transaction-commands";
import { cn } from "@/lib/utils";

export interface TransactionItemProps {
  transaction: TransactionDetailedDto & {
    detailedTags: (TagDto & Colorized)[];
    detailedPaidBy: JournalUserBasicDto;
    detailedAccount: JournalAccountBasicDto;
  };
  formatter: Intl.NumberFormat;
  commands?: TransactionCommand[];
  onTitleClick?: () => void | Promise<void>;
  onAccountClick?: () => void | Promise<void>;
}

export function TransactionItem({
  transaction,
  formatter,
  onTitleClick,
  onAccountClick,
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
          className={cn(
            "text-md font-medium leading-none",
            "cursor-pointer hover:text-muted-foreground transition-colors duration-150"
          )}
          onClick={onTitleClick}
        >
          {title.length > 30 ? `${title.slice(0, 30)}...` : title}
        </h4>
        <p className="text-sm text-muted-foreground">
          {firstName} {lastName}
        </p>
      </div>
      <div className="col-span-6 grid grid-cols-1 md:grid-cols-6">
        <div
          className={cn(
            "col-span-6 md:col-span-2 flex items-center justify-end md:justify-start gap-2 text-sm",
            "cursor-pointer hover:text-muted-foreground transition-colors duration-150",
            "order-2 md:order-none"
          )}
          onClick={onAccountClick}
        >
          {detailedAccount.type.toLowerCase() === "cash" && (
            <Wallet size="20" />
          )}
          {["credit", "debit"].includes(detailedAccount.type.toLowerCase()) && (
            <CreditCard size="20" />
          )}
          {detailedAccount.displayName}
        </div>
        <div className="col-span-6 md:col-span-3 order-3 md:order-none flex flex-col justify-end md:justify-start gap-1">
          <Tags tags={detailedTags} />
        </div>
        <div className="col-span-6 md:col-span-1 order-1 md:order-none flex flex-row justify-end gap-2 text-sm font-semibold h-fit">
          <span
            className={
              formattedAmount.startsWith("-")
                ? "text-red-500"
                : "text-green-600"
            }
          >
            {formattedAmount}
          </span>
          {commands.length > 0 && (
            <TransactionCommands
              commands={commands}
              transaction={transaction}
            />
          )}
        </div>
      </div>
    </div>
  );
}
