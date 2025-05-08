"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { TransactionDetailedDto } from "@/modules/journals/application/dto/dtos.types";
import {
  Archive,
  Copy,
  Edit,
  type LucideIcon,
  MoreVertical,
  Star,
  Trash,
} from "lucide-react";
import { Tags } from "../tag/tag-item";

// Define the command type for better type safety
export type TransactionCommand = {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: "default" | "destructive";
  disabled?: boolean;
  separator?: boolean;
};

export interface TransactionItemProps {
  transaction: TransactionDetailedDto;
  formatter: Intl.NumberFormat;
  commands?: TransactionCommand[];
}

const transactionCommands: TransactionCommand[] = [
  {
    label: "Edit",
    icon: Edit,
    onClick: () => console.log("Edit clicked"),
  },
  {
    label: "Duplicate",
    icon: Copy,
    onClick: () => console.log("Duplicate clicked"),
  },
  {
    label: "Star",
    icon: Star,
    onClick: () => console.log("Star clicked"),
  },
  {
    label: "Archive",
    icon: Archive,
    onClick: () => console.log("Archive clicked"),
    separator: true, // Adds a separator before this item
  },
  {
    label: "Delete",
    icon: Trash,
    onClick: () => {
      if (confirm("Are you sure you want to delete this record?")) {
        console.log("Delete confirmed");
      }
    },
    variant: "destructive", // Makes this item red
  },
];

export function TransactionItem({
  transaction: { accountId, amount: rawAmount, type, tags, title },
  formatter,
  commands = transactionCommands,
}: TransactionItemProps) {
  const account = accountId;
  const amount = formatter.format(type !== "INCOME" ? -rawAmount : rawAmount);

  return (
    <div className="flex items-start justify-between">
      <div className="flex flex-col gap-1">
        <h4 className="text-md font-medium leading-none">{title}</h4>
        <p className="text-sm text-muted-foreground">{account}</p>
        <Tags tags={tags} />
      </div>
      <div className="flex flex-row justify-end gap-2 text-sm font-semibold min-w-[100px]">
        <span
          className={amount.startsWith("-") ? "text-red-500" : "text-green-600"}
        >
          {amount}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-auto w-auto p-0">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {commands.map((command, index) => (
              <div key={index}>
                {command.separator && index > 0 && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  onClick={command.onClick}
                  disabled={command.disabled}
                  className={
                    command.variant === "destructive" ? "text-red-600" : ""
                  }
                >
                  {command.icon && (
                    <command.icon
                      className={cn(
                        "mr-2 h-4 w-4",
                        command.variant === "destructive" ? "text-red-600" : ""
                      )}
                    />
                  )}
                  {command.label}
                </DropdownMenuItem>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
