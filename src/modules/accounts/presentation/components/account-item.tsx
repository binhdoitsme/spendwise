import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AccountBasicDto } from "../../application/dto/dtos.types";
import { AccountCommand, AccountCommands } from "./account-commands";

type AccountCardProps = {
  account: AccountBasicDto;
  currentUserEmail?: string;
  commands?: AccountCommand[];
  layout?: "card" | "row";
} & React.ComponentProps<"div">;

export function AccountCard({
  account,
  currentUserEmail,
  commands = [],
  layout = "card",
  ...props
}: AccountCardProps) {
  return (
    <Card {...props}>
      <CardHeader>
        <div className="flex flex-row justify-between items-start">
          <div className="space-y-2">
            <CardTitle>{account.displayName}</CardTitle>
            <p className="text-sm text-muted-foreground capitalize">
              {account.type}
            </p>
          </div>
          {layout === "card" && commands.length > 0 && (
            <AccountCommands commands={commands} account={account} />
          )}
        </div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Owner: {""}
        {currentUserEmail === account.owner.email
          ? "You"
          : `${account.owner.firstName} ${account.owner.lastName}`}
      </CardContent>
      {layout === "row" && commands.length > 0 && (
        <CardFooter className="flex items-start">
          <AccountCommands commands={commands} account={account} />
        </CardFooter>
      )}
    </Card>
  );
}
