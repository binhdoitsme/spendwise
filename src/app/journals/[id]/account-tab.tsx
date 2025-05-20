import { ResponseWithData } from "@/app/api/api-responses";
import { useLoader } from "@/app/loader.context";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AccountBasicDto } from "@/modules/accounts/application/dto/dtos.types";
import { AccountApi } from "@/modules/accounts/presentation/api/account.api";
import { unlinkAccount } from "@/modules/accounts/presentation/components/account-commands";
import {
  AccountForm,
  AccountFormValues,
} from "@/modules/accounts/presentation/components/account-form";
import { AccountCard } from "@/modules/accounts/presentation/components/account-item";
import { useAuthContext } from "@/modules/auth/presentation/components/auth-context";
import { JournalAccountBasicDto } from "@/modules/journals/application/dto/dtos.types";
import { JournalApi } from "@/modules/journals/presentation/api/journal.api";
import { AxiosError } from "axios";
import { Link, PlusIcon } from "lucide-react";
import { ReactNode, useMemo, useState } from "react";
import { toast } from "sonner";

interface AccountTabProps {
  journalApi: JournalApi;
  journalId: string;
  accountApi: AccountApi;
  myAccounts: AccountBasicDto[];
  journalAccounts: JournalAccountBasicDto[];

  handleRefreshJournal: () => void | Promise<void>;
  handleRefreshAccounts: () => void | Promise<void>;
}

export function AccountTab({
  journalApi,
  journalId,
  accountApi,
  myAccounts,
  journalAccounts,
  handleRefreshJournal,
}: AccountTabProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState<ReactNode | null>(null);
  const authContext = useAuthContext();
  const { loadingStart, loadingEnd } = useLoader();
  const linkableAccounts = useMemo(
    () =>
      myAccounts.filter((account) =>
        journalAccounts.every(
          (journalAccount) => journalAccount.accountId !== account.id
        )
      ),
    [myAccounts, journalAccounts]
  );

  const handleLinkAccount = (accountId: string) => async () => {
    try {
      loadingStart();
      await journalApi.linkAccount(journalId, { accountId });
      toast.success("Successfully linked account to journal!");
      await handleRefreshJournal();
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Could not link selected account with current journal!");
    } finally {
      loadingEnd();
    }
  };

  const handleUnlinkAccount = async (account: AccountBasicDto) => {
    loadingStart();
    try {
      await journalApi.unlinkAccount(journalId, account.id);
      toast.success("Successfully unlinked account from journal!");
      await handleRefreshJournal();
      setOpen(false);
    } catch (err) {
      console.error(err);
      if (err instanceof AxiosError) {
        const errMessage = (err as AxiosError).response
          ?.data as ResponseWithData<{
          message: string;
        }>;
        toast.error(
          `Could not unlink selected account: ${errMessage.data.message}`
        );
      } else if (err instanceof Error) {
        const errMessage = (err as Error).message;
        toast.error(`Could not unlink selected account: ${errMessage}`);
      }
    } finally {
      loadingEnd();
    }
  };

  const handleCreateAccount = async (
    data: AccountFormValues
  ): Promise<void> => {
    try {
      loadingStart();
      await accountApi
        .createAccount({
          ...data,
        })
        .then(() => {
          toast.success("Successfully created new account!");
          setOpen(false);
        });
    } catch (err) {
      console.error(err);
      const errMessage =
        err instanceof AxiosError
          ? (
              (err as AxiosError).response?.data as ResponseWithData<{
                message: string;
              }>
            ).data.message
          : (err as Error).message;
      toast.error(`Could not create new account: ${errMessage}`);
    } finally {
      loadingEnd();
    }
  };

  const showNewAccountDialog = () => {
    setContent(
      <>
        <DialogHeader>
          <DialogTitle>New Account</DialogTitle>
        </DialogHeader>
        <AccountForm className="h-full mt-2" onSubmit={handleCreateAccount} />
      </>
    );
  };

  const showLinkAccountDialog = () => {
    setContent(
      <>
        <DialogHeader>
          <DialogTitle>Link your Account</DialogTitle>
        </DialogHeader>
        <div className="w-full py-2 grid grid-cols-1 gap-2">
          {linkableAccounts.length === 0 && <p>No new account to link</p>}
          {linkableAccounts.map((account) => (
            <AccountCard
              key={account.id}
              className="flex flex-row justify-between cursor-pointer transition-all duration-300 hover:bg-secondary"
              account={account}
              currentUserEmail={authContext.user?.email}
              onClick={handleLinkAccount(account.id)}
            />
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="w-full h-full overflow-scroll">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            className="w-full md:w-auto gap-0"
            onClick={showNewAccountDialog}
          >
            <PlusIcon className="w-4 h-4 mr-2" /> New Account
          </Button>
        </DialogTrigger>
        <DialogTrigger asChild>
          <Button
            className="w-full md:w-auto gap-0 mx-2"
            variant="outline"
            onClick={showLinkAccountDialog}
            disabled={linkableAccounts.length === 0}
          >
            <Link className="w-4 h-4 mr-2" /> Link your Account
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">{content}</DialogContent>
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
