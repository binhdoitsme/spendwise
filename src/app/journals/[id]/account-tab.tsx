import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AccountBasicDto } from "@/modules/accounts/application/dto/dtos.types";
import { AccountApi } from "@/modules/accounts/presentation/api/account.api";
import { unlinkAccount } from "@/modules/accounts/presentation/components/account-commands";
import { AccountCard } from "@/modules/accounts/presentation/components/account-item";
import { JournalAccountBasicDto } from "@/modules/journals/application/dto/dtos.types";
import { JournalApi } from "@/modules/journals/presentation/api/journal.api";
import { Link, PlusIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AccountDialogContent, AccountDialogType } from "./account-dialogs";
import { useAccountTabHandlers } from "./account-handlers";
import { convertToCurrentUser } from "@/modules/users/presentation/components/display-user";
import { useAuthContext } from "@/modules/auth/presentation/components/auth-context";

interface AccountTabProps {
  journalApi: JournalApi;
  journalId: string;
  accountApi: AccountApi;
  myAccounts: AccountBasicDto[];
  journalAccounts: JournalAccountBasicDto[];

  handleRefreshJournal: () => void | Promise<void>;
  handleRefreshAccounts: () => void | Promise<void>;
}

export function AccountTab(props: AccountTabProps) {
  const { myAccounts, journalAccounts } = props;
  const authContext = useAuthContext();
  const [open, setOpen] = useState(false);
  const [dialogType, setDialogType] = useState<AccountDialogType>(null);
  const linkableAccounts = useMemo(
    () =>
      myAccounts.filter((account) =>
        journalAccounts.every(
          (journalAccount) => journalAccount.accountId !== account.id
        )
      ),
    [myAccounts, journalAccounts]
  );

  const { handleUnlinkAccount } = useAccountTabHandlers({ ...props, setOpen });

  useEffect(() => {
    if (!!dialogType) {
      setOpen(true);
    }
  }, [dialogType]);

  return (
    <div className="w-full h-full overflow-scroll">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            className="w-full md:w-auto gap-0"
            onClick={() => setDialogType("newAccount")}
          >
            <PlusIcon className="w-4 h-4 mr-2" /> New Account
          </Button>
        </DialogTrigger>
        <DialogTrigger asChild>
          <Button
            className="w-full md:w-auto gap-0 mx-2"
            variant="outline"
            onClick={() => setDialogType("linkAccount")}
            disabled={linkableAccounts.length === 0}
          >
            <Link className="w-4 h-4 mr-2" /> Link your Account
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <AccountDialogContent
            dialogType={dialogType}
            setOpen={setOpen}
            linkableAccounts={linkableAccounts}
            {...props}
          />
        </DialogContent>
      </Dialog>
      <ScrollArea className="w-full max-h-[calc(100vh-480px)]">
        {journalAccounts.length === 0 && (
          <p className="mt-4 italic opacity-50">
            No account added. Create a new account or link your existing ones.
          </p>
        )}
        <div className="w-full py-4 grid grid-cols-2 gap-2">
          {journalAccounts.map((account) => (
            <AccountCard
              key={account.accountId}
              className="flex flex-col justify-between"
              account={{
                ...account,
                id: account.accountId,
                owner: convertToCurrentUser(account.owner, authContext.user!),
                type: account.type as "cash" | "credit" | "debit" | "loan",
              }}
              commands={[unlinkAccount(handleUnlinkAccount)]}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
