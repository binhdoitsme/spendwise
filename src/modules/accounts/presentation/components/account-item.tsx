import { Localizable } from "@/components/common/i18n";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { convertToCurrentUser } from "@/modules/users/presentation/components/display-user";
import { AccountBasicDto } from "../../application/dto/dtos.types";
import { accountLabels } from "../labels";
import { AccountCommand, AccountCommands } from "./account-commands";

type AccountCardProps = {
  account: AccountBasicDto;
  currentUserEmail?: string;
  commands?: AccountCommand[];
  layout?: "card" | "row";
} & React.ComponentProps<"div"> &
  Localizable;

export function AccountCard({
  account,
  currentUserEmail,
  commands = [],
  layout = "card",
  language = "en",
  ...props
}: AccountCardProps) {
  const labels = accountLabels[language];

  const convertedUser = convertToCurrentUser(
    account.owner,
    currentUserEmail,
    labels.you
  );

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
            <AccountCommands
              language={language}
              commands={commands}
              account={account}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {labels.owner}: {""}
        {convertedUser.firstName} {convertedUser.lastName}
      </CardContent>
      {layout === "row" && commands.length > 0 && (
        <CardFooter className="flex items-start">
          <AccountCommands
            language={language}
            commands={commands}
            account={account}
          />
        </CardFooter>
      )}
    </Card>
  );
}
