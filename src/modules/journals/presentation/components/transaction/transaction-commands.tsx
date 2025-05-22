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
  Eye,
  type LucideIcon,
  MoreHorizontal,
  Trash
} from "lucide-react";

export type TransactionCommand<T extends Array<unknown> = unknown[]> = {
  label: string;
  icon?: LucideIcon;
  handleCommand: (...args: T) => void | Promise<void>;
  variant?: "default" | "destructive";
  disabled?: boolean;
  separator?: boolean;
};

export const editTransaction = (
  handleEditTransaction: (transaction: TransactionDetailedDto) => void
) =>
  ({
    label: "Edit",
    icon: Edit,
    handleCommand: handleEditTransaction,
  } as TransactionCommand);

export const duplicateTransaction = (
  handleDuplicateTransaction: (transaction: TransactionDetailedDto) => void
) =>
  ({
    label: "Duplicate",
    icon: Copy,
    handleCommand: handleDuplicateTransaction,
  } as TransactionCommand);

export const archiveTransaction = (
  handleArchiveTransaction: (transaction: TransactionDetailedDto) => void
) =>
  ({
    label: "Archive",
    icon: Archive,
    handleCommand: handleArchiveTransaction,
    separator: true,
  } as TransactionCommand);

export const deleteTransaction = (
  handleDeleteTransaction: (transaction: TransactionDetailedDto) => void
) =>
  ({
    label: "Delete",
    icon: Trash,
    handleCommand: handleDeleteTransaction,
    variant: "destructive",
  } as TransactionCommand);

export const viewTransaction = (
  handleViewTransaction: (transaction: TransactionDetailedDto) => void
) =>
  ({
    label: "View",
    icon: Eye,
    handleCommand: handleViewTransaction,
  } as TransactionCommand);

export function TransactionCommands({
  commands,
  transaction,
}: {
  transaction: TransactionDetailedDto;
  commands: TransactionCommand[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-auto w-auto p-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {commands.map((command, index) => (
          <div key={index}>
            {command.separator && index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={() => command.handleCommand(transaction)}
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
  );
}
