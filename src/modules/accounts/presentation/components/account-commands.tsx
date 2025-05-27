import { Language, Localizable } from "@/components/common/i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Edit,
  Eye,
  Link2Off,
  LucideIcon,
  MoreVertical,
  Trash,
} from "lucide-react";
import { AccountBasicDto } from "../../application/dto/dtos.types";
import { accountLabels } from "../labels";

// Define the command type for better type safety
export type AccountCommand<T extends Array<unknown> = unknown[]> = {
  label: string;
  icon?: LucideIcon;
  handleCommand: (...args: T) => void | Promise<void>;
  variant?: "default" | "destructive";
  disabled?: boolean;
  separator?: boolean;
};

export const viewAccount =
  (language: Language) =>
  (handleViewAccount: (account: AccountBasicDto) => void | Promise<void>) =>
    ({
      label: accountLabels[language].view,
      icon: Eye,
      handleCommand: handleViewAccount,
    } as AccountCommand);

export const editAccount =
  (language: Language) =>
  (handleEditAccount: (account: AccountBasicDto) => void | Promise<void>) =>
    ({
      label: accountLabels[language].edit,
      icon: Edit,
      handleCommand: handleEditAccount,
    } as AccountCommand);

export const unlinkAccount =
  (language: Language) =>
  (handleUnlinkAccount: (account: AccountBasicDto) => void | Promise<void>) =>
    ({
      label: accountLabels[language].unlink,
      icon: Link2Off,
      handleCommand: handleUnlinkAccount,
      separator: true,
    } as AccountCommand);

export const deleteAccount =
  (language: Language) =>
  (handleDeleteAccount: (account: AccountBasicDto) => void | Promise<void>) =>
    ({
      label: accountLabels[language].delete,
      icon: Trash,
      handleCommand: handleDeleteAccount,
      variant: "destructive",
    } as AccountCommand);

interface AccountCommandProps extends Localizable {
  commands: AccountCommand[];
  account: AccountBasicDto;
}

export function AccountCommands({ commands, account }: AccountCommandProps) {
  return (
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
              onClick={() => command.handleCommand(account)}
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
