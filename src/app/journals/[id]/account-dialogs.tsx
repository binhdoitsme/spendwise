import { useLoader } from "@/app/loader.context";
import { useI18n } from "@/components/common/i18n";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AccountBasicDto } from "@/modules/accounts/application/dto/dtos.types";
import { AccountApi } from "@/modules/accounts/presentation/api/account.api";
import {
  AccountForm,
  AccountFormValues,
} from "@/modules/accounts/presentation/components/account-form";
import { AccountCard } from "@/modules/accounts/presentation/components/account-item";
import { useAuthContext } from "@/modules/auth/presentation/components/auth-context";
import { JournalApi } from "@/modules/journals/presentation/api/journal.api";
import { extractErrorMessage } from "@/modules/shared/presentation/errors";
import { toast } from "sonner";

interface AccountDialogContentProps {
  journalApi: JournalApi;
  journalId: string;
  accountApi: AccountApi;
  linkableAccounts: AccountBasicDto[];
  setOpen: (value: boolean) => void;
  handleRefreshJournal: () => void | Promise<void>;
  handleRefreshAccounts: () => void | Promise<void>;
}

function LinkAccountDialogContent({
  journalApi,
  journalId,
  linkableAccounts,
  setOpen,
  handleRefreshJournal,
}: AccountDialogContentProps) {
  const { loadingStart, loadingEnd } = useLoader();
  const authContext = useAuthContext();
  const { language } = useI18n();

  const handleLinkAccount = (accountId: string) => async () => {
    try {
      loadingStart();
      await journalApi.linkAccount(journalId, { accountId });
      toast.success("Successfully linked account to journal!");
      await handleRefreshJournal();
      setOpen(false);
    } catch (err) {
      console.error(err);
      const errorMessage = extractErrorMessage(err);
      toast.error(
        `Could not link selected account with current journal: ${errorMessage}`
      );
    } finally {
      loadingEnd();
    }
  };

  return (
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
            language={language}
          />
        ))}
      </div>
    </>
  );
}

function NewAccountDialogContent({
  journalApi,
  journalId,
  accountApi,
  setOpen,
  handleRefreshJournal,
  handleRefreshAccounts,
}: AccountDialogContentProps) {
  const { loadingStart, loadingEnd, isLoading } = useLoader();
  const { language } = useI18n();

  const handleCreateAccount = async (
    data: AccountFormValues
  ): Promise<void> => {
    try {
      loadingStart();
      const { accountId } = await accountApi.createAccount({
        ...data,
      });
      await journalApi.linkAccount(journalId, { accountId });
      await Promise.all([handleRefreshJournal(), handleRefreshAccounts()]);
      toast.success("Successfully created new account!");
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(`Could not create new account: ${extractErrorMessage(err)}`);
    } finally {
      loadingEnd();
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>New Account</DialogTitle>
      </DialogHeader>
      <AccountForm
        language={language}
        className="h-full mt-2"
        onSubmit={handleCreateAccount}
        disabled={isLoading}
      />
    </>
  );
}

export type AccountDialogType = "newAccount" | "linkAccount" | null;

export function AccountDialogContent({
  dialogType,
  ...props
}: AccountDialogContentProps & { dialogType: AccountDialogType }) {
  if (dialogType === "newAccount") {
    return NewAccountDialogContent(props);
  } else if (dialogType === "linkAccount") {
    return LinkAccountDialogContent(props);
  }
  return null;
}
