import { useLoader } from "@/app/loader.context";
import { useI18n } from "@/components/common/i18n";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AccountBasicDto } from "@/modules/accounts/application/dto/dtos.types";
import { AccountApi } from "@/modules/accounts/presentation/api/account.api";
import { unlinkAccount } from "@/modules/accounts/presentation/components/account-commands";
import { AccountCard } from "@/modules/accounts/presentation/components/account-item";
import { useAuthContext } from "@/modules/auth/presentation/components/auth-context";
import { JournalAccountBasicDto } from "@/modules/journals/application/dto/dtos.types";
import { JournalApi } from "@/modules/journals/presentation/api/journal.api";
import { extractErrorMessage } from "@/modules/shared/presentation/errors";
import { Link, PlusIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AccountDialogContent, AccountDialogType } from "./account-dialogs";
import { journalDetailsPageLabels } from "./labels";

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
  const {
    myAccounts,
    journalAccounts,
    journalApi,
    handleRefreshJournal,
    journalId,
  } = props;
  const authContext = useAuthContext();
  const { language } = useI18n();
  const labels = journalDetailsPageLabels[language];
  const { loadingStart, loadingEnd } = useLoader();
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

  const handleUnlinkAccount = async (account: AccountBasicDto) => {
    loadingStart();
    try {
      await journalApi.unlinkAccount(journalId, account.id);
      toast.success("Successfully unlinked account from journal!");
      await handleRefreshJournal();
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(
        `Could not unlink selected account: ${extractErrorMessage(err)}`
      );
    } finally {
      loadingEnd();
    }
  };

  useEffect(() => {
    if (!!dialogType) {
      setOpen(true);
    }
  }, [dialogType]);

  return (
    <div className="w-full h-full flex flex-col">
      <div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              className="w-full md:w-auto gap-0"
              onClick={() => setDialogType("newAccount")}
            >
              <PlusIcon className="w-4 h-4 mr-2" /> {labels.newAccount}
            </Button>
          </DialogTrigger>
          <DialogTrigger asChild>
            <Button
              className="w-full md:w-auto gap-0 mx-2"
              variant="outline"
              onClick={() => setDialogType("linkAccount")}
              disabled={linkableAccounts.length === 0}
            >
              <Link className="w-4 h-4 mr-2" /> {labels.linkAccount}
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
      </div>
      <div className="w-full flex-1 overflow-scroll">
        {journalAccounts.length === 0 && (
          <p className="mt-4 italic opacity-50">{labels.noAccounts}</p>
        )}
        <div className="w-full py-4 grid grid-cols-2 gap-2">
          {journalAccounts.map((account) => (
            <AccountCard
              language={language}
              key={account.accountId}
              className="flex flex-col justify-between"
              account={{
                ...account,
                id: account.accountId,
                type: account.type as "cash" | "credit" | "debit" | "loan",
              }}
              currentUserEmail={authContext.user?.email}
              commands={[unlinkAccount(language)(handleUnlinkAccount)]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
